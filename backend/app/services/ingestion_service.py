"""
Ingestion orchestration service.

NOTE: No changes were needed in this file — it already correctly accepts
job_id and processes an existing job when one is passed in. The bug was
that nothing was calling run_publication_ingestion()/run_patent_ingestion()
with the job_id of rows created elsewhere (e.g. by an admin endpoint) —
see the fixed scheduler.py's _process_pending_jobs() for the missing piece.

Coordinates:
- Calling OpenAlex / Lens iterators
- Normalising records
- Upserting into global_publications / global_patents
- Updating DataIngestionJob tracking record
- Transaction-safe batch commits (one commit per batch, not per record)
- Full logging

This module contains pure business logic and has no HTTP/FastAPI coupling,
making it trivially testable and re-usable by both the scheduler and the
admin HTTP endpoints.
"""
import logging
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.ingestion_job import DataIngestionJob
from app.models.global_publication import GlobalPublication
from app.models.global_patent import GlobalPatent
from app.services import openalex_service, lens_service

logger = logging.getLogger(__name__)

COMMIT_BATCH_SIZE = 50   # commit after this many records


# ---------------------------------------------------------------------------
# Job helpers
# ---------------------------------------------------------------------------

def create_job(db: Session, source: str, entity_type: str, query: str) -> DataIngestionJob:
    """Create and persist a new DataIngestionJob in 'pending' state."""
    job = DataIngestionJob(
        source=source,
        entity_type=entity_type,
        status="pending",
        query=query,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def _mark_running(db: Session, job: DataIngestionJob):
    job.status = "running"
    job.started_at = datetime.utcnow()
    db.commit()


def _mark_done(db: Session, job: DataIngestionJob):
    job.status = "completed"
    job.completed_at = datetime.utcnow()
    db.commit()


def _mark_failed(db: Session, job: DataIngestionJob, error: str):
    job.status = "failed"
    job.completed_at = datetime.utcnow()
    job.error_message = error[:2000] if error else None
    db.commit()


def _flush_counters(db: Session, job: DataIngestionJob):
    """Persist in-memory counters without changing status."""
    db.commit()


# ---------------------------------------------------------------------------
# Publication ingestion
# ---------------------------------------------------------------------------

def run_publication_ingestion(
    db: Session,
    query: str,
    max_records: int = 10_000,
    job_id: Optional[str] = None,
) -> DataIngestionJob:
    """
    Ingest publications from OpenAlex into global_publications.
    Creates a new job if job_id is None, otherwise loads the existing one.
    """
    if job_id:
        job = db.query(DataIngestionJob).filter(DataIngestionJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")
    else:
        job = create_job(db, source="openalex", entity_type="publication", query=query)

    logger.info("[Ingestion] Starting OpenAlex publication ingestion. job=%s query=%r", job.id, query)
    _mark_running(db, job)

    pending_batch = []

    try:
        for raw_work in openalex_service.iter_works(query, max_records):
            normalized = openalex_service.normalize_publication(raw_work)
            if normalized is None:
                job.records_failed += 1
                continue

            job.records_processed += 1
            pending_batch.append(normalized)

            if len(pending_batch) >= COMMIT_BATCH_SIZE:
                _upsert_publications(db, job, pending_batch)
                pending_batch.clear()
                _flush_counters(db, job)

        # Flush remainder
        if pending_batch:
            _upsert_publications(db, job, pending_batch)

        _mark_done(db, job)
        logger.info(
            "[Ingestion] OpenAlex completed. job=%s processed=%d created=%d updated=%d failed=%d",
            job.id, job.records_processed, job.records_created, job.records_updated, job.records_failed,
        )

    except Exception as exc:
        logger.exception("[Ingestion] OpenAlex ingestion crashed. job=%s", job.id)
        _mark_failed(db, job, str(exc))

    return job


def _upsert_publications(db: Session, job: DataIngestionJob, batch: list):
    """Upsert a batch of normalised publication dicts. One DB transaction per batch."""
    for item in batch:
        try:
            existing = db.query(GlobalPublication).filter(
                GlobalPublication.source == item["source"],
                GlobalPublication.external_id == item["external_id"],
            ).first()

            if existing:
                # Update mutable fields
                existing.citation_count = item.get("citation_count", existing.citation_count)
                existing.abstract = item.get("abstract") or existing.abstract
                existing.topics = item.get("topics") or existing.topics
                existing.raw_metadata = item.get("raw_metadata") or existing.raw_metadata
                existing.updated_at = datetime.utcnow()
                job.records_updated += 1
            else:
                pub = GlobalPublication(**item)
                db.add(pub)
                job.records_created += 1

        except Exception as exc:
            logger.warning("[Ingestion] Skipping publication %s: %s", item.get("external_id"), exc)
            db.rollback()
            job.records_failed += 1
            continue

    try:
        db.commit()
    except IntegrityError:
        logger.warning("[Ingestion] Integrity error in publication batch — rolling back batch.")
        db.rollback()
        job.records_failed += len(batch)


# ---------------------------------------------------------------------------
# Patent ingestion
# ---------------------------------------------------------------------------

def run_patent_ingestion(
    db: Session,
    query: str,
    max_records: int = 10_000,
    job_id: Optional[str] = None,
) -> DataIngestionJob:
    """
    Ingest patents from Lens into global_patents.
    Creates a new job if job_id is None, otherwise loads the existing one.
    """
    if job_id:
        job = db.query(DataIngestionJob).filter(DataIngestionJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")
    else:
        job = create_job(db, source="lens", entity_type="patent", query=query)

    logger.info("[Ingestion] Starting Lens patent ingestion. job=%s query=%r", job.id, query)
    _mark_running(db, job)

    pending_batch = []

    try:
        for raw_patent in lens_service.iter_patents(query, max_records):
            normalized = lens_service.normalize_patent(raw_patent)
            if normalized is None:
                job.records_failed += 1
                continue

            job.records_processed += 1
            pending_batch.append(normalized)

            if len(pending_batch) >= COMMIT_BATCH_SIZE:
                _upsert_patents(db, job, pending_batch)
                pending_batch.clear()
                _flush_counters(db, job)

        if pending_batch:
            _upsert_patents(db, job, pending_batch)

        _mark_done(db, job)
        logger.info(
            "[Ingestion] Lens completed. job=%s processed=%d created=%d updated=%d failed=%d",
            job.id, job.records_processed, job.records_created, job.records_updated, job.records_failed,
        )

    except Exception as exc:
        logger.exception("[Ingestion] Lens ingestion crashed. job=%s", job.id)
        _mark_failed(db, job, str(exc))

    return job


def _upsert_patents(db: Session, job: DataIngestionJob, batch: list):
    """Upsert a batch of normalised patent dicts. One DB transaction per batch."""
    for item in batch:
        try:
            existing = db.query(GlobalPatent).filter(
                GlobalPatent.source == item["source"],
                GlobalPatent.external_id == item["external_id"],
            ).first()

            if existing:
                existing.status = item.get("status") or existing.status
                existing.classification = item.get("classification") or existing.classification
                existing.raw_metadata = item.get("raw_metadata") or existing.raw_metadata
                existing.updated_at = datetime.utcnow()
                job.records_updated += 1
            else:
                pat = GlobalPatent(**item)
                db.add(pat)
                job.records_created += 1

        except Exception as exc:
            logger.warning("[Ingestion] Skipping patent %s: %s", item.get("external_id"), exc)
            db.rollback()
            job.records_failed += 1
            continue

    try:
        db.commit()
    except IntegrityError:
        logger.warning("[Ingestion] Integrity error in patent batch — rolling back batch.")
        db.rollback()
        job.records_failed += len(batch)