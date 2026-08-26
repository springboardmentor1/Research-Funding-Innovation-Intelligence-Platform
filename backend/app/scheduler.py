"""
APScheduler-based background scheduler for periodic ingestion.

The scheduler is started inside the FastAPI lifespan event so it shares
the same process lifetime as the server.

Ingestion frequency is configured via:
  INGESTION_SCHEDULE_HOURS=24   (default: 24 hours)

Topics/queries used for scheduled ingestion are configurable via:
  SCHEDULED_PUBLICATION_QUERY="artificial intelligence machine learning"
  SCHEDULED_PATENT_QUERY="artificial intelligence"
  SCHEDULED_MAX_RECORDS=5000    (default 5000 per run)

Pending-job polling (NEW):
  PENDING_JOB_POLL_SECONDS=60   (default: check for pending jobs every 60s)

  This is the piece that was missing before: any job row created with
  status='pending' (e.g. by an admin/API endpoint calling
  ingestion_service.create_job(...) directly) was never picked up and
  processed — nothing in the old scheduler ever queried for pending rows.
  _process_pending_jobs() below closes that gap.
"""
import os
import logging
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SCHEDULE_HOURS = int(os.getenv("INGESTION_SCHEDULE_HOURS", "24"))
PUB_QUERY = os.getenv("SCHEDULED_PUBLICATION_QUERY", "artificial intelligence machine learning")
PAT_QUERY = os.getenv("SCHEDULED_PATENT_QUERY", "artificial intelligence")
MAX_RECORDS = int(os.getenv("SCHEDULED_MAX_RECORDS", "5000"))
PENDING_POLL_SECONDS = int(os.getenv("PENDING_JOB_POLL_SECONDS", "60"))


def _make_session():
    # FIX: reuse the app's single shared engine + SessionLocal from
    # connection.py instead of calling create_engine() again here. The old
    # version built a brand-new engine (with its own separate connection
    # pool) on every scheduler call — the pending-job poller alone did this
    # every 60 seconds. Multiple independent pools were competing for the
    # database's total connection budget, which is why frontend requests
    # (using the app's own pool via get_db) hung forever waiting for a
    # connection instead of erroring out.
    from app.database.connection import SessionLocal

    return SessionLocal()


def _scheduled_publication_job():
    """Called periodically by APScheduler — creates + runs its own default job."""
    from app.services import ingestion_service

    logger.info("[Scheduler] Scheduled publication ingestion starting at %s", datetime.utcnow())
    db = _make_session()
    try:
        ingestion_service.run_publication_ingestion(db, PUB_QUERY, MAX_RECORDS)
    except Exception as exc:
        logger.exception("[Scheduler] Publication ingestion failed: %s", exc)
    finally:
        db.close()


def _scheduled_patent_job():
    """Called periodically by APScheduler — creates + runs its own default job."""
    from app.services import ingestion_service

    logger.info("[Scheduler] Scheduled patent ingestion starting at %s", datetime.utcnow())
    db = _make_session()
    try:
        ingestion_service.run_patent_ingestion(db, PAT_QUERY, MAX_RECORDS)
    except Exception as exc:
        logger.exception("[Scheduler] Patent ingestion failed: %s", exc)
    finally:
        db.close()


def _process_pending_jobs():
    """
    Polls DataIngestionJob for status='pending' rows (created by admin/API
    endpoints) and actually runs them. This is what was missing: rows were
    being inserted as 'pending' but nothing ever called run_*_ingestion()
    with their job_id, so they sat there forever with started_at=NULL.
    """
    from app.models.ingestion_job import DataIngestionJob
    from app.services import ingestion_service

    db = _make_session()
    try:
        pending_jobs = (
            db.query(DataIngestionJob)
            .filter(DataIngestionJob.status == "pending")
            .order_by(DataIngestionJob.id)
            .all()
        )

        if not pending_jobs:
            return

        logger.info("[Scheduler] Found %d pending job(s) to process", len(pending_jobs))

        for job in pending_jobs:
            try:
                if job.entity_type == "publication" or job.source == "openalex":
                    ingestion_service.run_publication_ingestion(
                        db, job.query, MAX_RECORDS, job_id=job.id
                    )
                elif job.entity_type == "patent" or job.source == "lens":
                    ingestion_service.run_patent_ingestion(
                        db, job.query, MAX_RECORDS, job_id=job.id
                    )
                else:
                    logger.warning(
                        "[Scheduler] Job %s has unknown source/entity_type (%s/%s) — skipping",
                        job.id, job.source, job.entity_type,
                    )
            except Exception:
                logger.exception("[Scheduler] Failed to process pending job %s", job.id)
    finally:
        db.close()


def create_scheduler() -> BackgroundScheduler:
    """
    Build and return a configured APScheduler instance.
    Does NOT start it — the caller (lifespan) is responsible.
    """
    scheduler = BackgroundScheduler(timezone="UTC")

    # Default periodic ingestion (own query, own job) — now starts immediately
    # on boot instead of waiting SCHEDULE_HOURS for the first run.
    scheduler.add_job(
        _scheduled_publication_job,
        trigger=IntervalTrigger(hours=SCHEDULE_HOURS),
        id="scheduled_publication_ingestion",
        name="Scheduled OpenAlex Publication Ingestion",
        replace_existing=True,
        max_instances=1,
        next_run_time=datetime.utcnow(),
    )

    scheduler.add_job(
        _scheduled_patent_job,
        trigger=IntervalTrigger(hours=SCHEDULE_HOURS, minutes=30),
        id="scheduled_patent_ingestion",
        name="Scheduled Lens Patent Ingestion",
        replace_existing=True,
        max_instances=1,
        next_run_time=datetime.utcnow(),
    )

    # NEW: frequent poller that picks up any pending job (e.g. ones created
    # by an admin/API endpoint) and actually runs it.
    scheduler.add_job(
        _process_pending_jobs,
        trigger=IntervalTrigger(seconds=PENDING_POLL_SECONDS),
        id="pending_job_poller",
        name="Pending Ingestion Job Poller",
        replace_existing=True,
        max_instances=1,
        next_run_time=datetime.utcnow(),
    )

    logger.info(
        "[Scheduler] Configured: publication every %dh, patent every %dh (+30m), "
        "pending-job poll every %ds",
        SCHEDULE_HOURS, SCHEDULE_HOURS, PENDING_POLL_SECONDS,
    )
    return scheduler