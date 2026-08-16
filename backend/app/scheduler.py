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


def _scheduled_publication_job():
    """Called periodically by APScheduler — uses its own DB session."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.database.connection import DATABASE_URL
    from app.services import ingestion_service

    logger.info("[Scheduler] Scheduled publication ingestion starting at %s", datetime.utcnow())
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        ingestion_service.run_publication_ingestion(db, PUB_QUERY, MAX_RECORDS)
    except Exception as exc:
        logger.exception("[Scheduler] Publication ingestion failed: %s", exc)
    finally:
        db.close()
        engine.dispose()


def _scheduled_patent_job():
    """Called periodically by APScheduler — uses its own DB session."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.database.connection import DATABASE_URL
    from app.services import ingestion_service

    logger.info("[Scheduler] Scheduled patent ingestion starting at %s", datetime.utcnow())
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        ingestion_service.run_patent_ingestion(db, PAT_QUERY, MAX_RECORDS)
    except Exception as exc:
        logger.exception("[Scheduler] Patent ingestion failed: %s", exc)
    finally:
        db.close()
        engine.dispose()


def create_scheduler() -> BackgroundScheduler:
    """
    Build and return a configured APScheduler instance.
    Does NOT start it — the caller (lifespan) is responsible.
    """
    scheduler = BackgroundScheduler(timezone="UTC")

    scheduler.add_job(
        _scheduled_publication_job,
        trigger=IntervalTrigger(hours=SCHEDULE_HOURS),
        id="scheduled_publication_ingestion",
        name="Scheduled OpenAlex Publication Ingestion",
        replace_existing=True,
        max_instances=1,   # prevent overlap if previous run is still active
    )

    scheduler.add_job(
        _scheduled_patent_job,
        trigger=IntervalTrigger(hours=SCHEDULE_HOURS, minutes=30),  # offset by 30 min
        id="scheduled_patent_ingestion",
        name="Scheduled Lens Patent Ingestion",
        replace_existing=True,
        max_instances=1,
    )

    logger.info(
        "[Scheduler] Configured: publication every %dh, patent every %dh (+30m)",
        SCHEDULE_HOURS, SCHEDULE_HOURS,
    )
    return scheduler
