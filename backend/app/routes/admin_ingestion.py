"""
Admin-only ingestion management endpoints.

Routes:
  POST /admin/ingestion/publications  — trigger background publication ingestion
  POST /admin/ingestion/patents       — trigger background patent ingestion
  GET  /admin/ingestion/jobs          — list all ingestion jobs (paginated)
  GET  /admin/ingestion/jobs/{job_id} — get single job status

Only users with role "Administrator" can access these endpoints.
API keys are never returned in responses.
"""
import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, BackgroundTasks, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.auth_service import get_current_user, RoleChecker
from app.models.user import User
from app.models.ingestion_job import DataIngestionJob
from app.services import ingestion_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/ingestion", tags=["Admin – Ingestion"])

# Only Administrators can access this router
admin_only = RoleChecker(["Administrator"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class IngestionRequest(BaseModel):
    query: str = "artificial intelligence"
    max_records: int = 1000

    class Config:
        json_schema_extra = {
            "example": {"query": "machine learning", "max_records": 500}
        }


class JobResponse(BaseModel):
    id: str
    source: str
    entity_type: str
    status: str
    query: Optional[str]
    started_at: Optional[str]
    completed_at: Optional[str]
    created_at: Optional[str]
    records_processed: int
    records_created: int
    records_updated: int
    records_failed: int
    error_message: Optional[str]

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Background runner (thin wrapper to pass a fresh DB session)
# ---------------------------------------------------------------------------

def _run_pub_ingestion_bg(query: str, max_records: int, job_id: str, db_url: str):
    """Runs in FastAPI BackgroundTasks — uses its own DB session."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        ingestion_service.run_publication_ingestion(db, query, max_records, job_id)
    finally:
        db.close()


def _run_patent_ingestion_bg(query: str, max_records: int, job_id: str, db_url: str):
    """Runs in FastAPI BackgroundTasks — uses its own DB session."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        ingestion_service.run_patent_ingestion(db, query, max_records, job_id)
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/publications", status_code=status.HTTP_202_ACCEPTED)
def trigger_publication_ingestion(
    req: IngestionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Start a background job to ingest research papers from OpenAlex.
    Returns immediately with the job ID — poll /jobs/{job_id} for status.
    """
    if req.max_records < 1 or req.max_records > 100_000:
        raise HTTPException(status_code=400, detail="max_records must be between 1 and 100000")

    # Create the job record synchronously so the caller gets an ID immediately
    job = ingestion_service.create_job(db, "openalex", "publication", req.query)

    # Resolve DB URL from the existing engine for the background thread
    from app.database.connection import engine as _engine
    db_url = str(_engine.url)

    background_tasks.add_task(_run_pub_ingestion_bg, req.query, req.max_records, job.id, db_url)
    logger.info("[Admin] Publication ingestion job %s queued by %s", job.id, current_user.email)

    return {
        "message": "Publication ingestion started",
        "job_id": job.id,
        "status": "pending",
    }


@router.post("/patents", status_code=status.HTTP_202_ACCEPTED)
def trigger_patent_ingestion(
    req: IngestionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Start a background job to ingest patents from The Lens.
    Returns immediately with the job ID — poll /jobs/{job_id} for status.
    """
    if req.max_records < 1 or req.max_records > 100_000:
        raise HTTPException(status_code=400, detail="max_records must be between 1 and 100000")

    job = ingestion_service.create_job(db, "lens", "patent", req.query)

    from app.database.connection import engine as _engine
    db_url = str(_engine.url)

    background_tasks.add_task(_run_patent_ingestion_bg, req.query, req.max_records, job.id, db_url)
    logger.info("[Admin] Patent ingestion job %s queued by %s", job.id, current_user.email)

    return {
        "message": "Patent ingestion started",
        "job_id": job.id,
        "status": "pending",
    }


@router.get("/jobs", response_model=List[JobResponse])
def list_ingestion_jobs(
    source: Optional[str] = Query(None, description="Filter by source: openalex | lens"),
    entity_type: Optional[str] = Query(None, description="Filter by entity_type: publication | patent"),
    job_status: Optional[str] = Query(None, alias="status", description="pending|running|completed|failed"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """List all ingestion jobs with optional filters and pagination."""
    q = db.query(DataIngestionJob)
    if source:
        q = q.filter(DataIngestionJob.source == source)
    if entity_type:
        q = q.filter(DataIngestionJob.entity_type == entity_type)
    if job_status:
        q = q.filter(DataIngestionJob.status == job_status)

    jobs = q.order_by(DataIngestionJob.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return [JobResponse(**j.to_dict()) for j in jobs]


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_ingestion_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Get detailed status of a specific ingestion job."""
    job = db.query(DataIngestionJob).filter(DataIngestionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Ingestion job not found")
    return JobResponse(**job.to_dict())
