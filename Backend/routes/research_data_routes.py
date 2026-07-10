from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database.db import get_db
from models.research_data import Publication, Grant, Patent
from schemas.research_data_schema import PublicationResponse, GrantResponse, PatentResponse
from typing import List, Optional

router = APIRouter(prefix="/research-data", tags=["Research Data"])

@router.get("/publications", response_model=List[PublicationResponse])
def get_publications(
    query: Optional[str] = Query(None, description="Search keyword in title, authors, or domain"),
    db: Session = Depends(get_db)
):
    """Retrieves publications from SQLite, optionally filtered by query."""
    q = db.query(Publication)
    if query:
        q = q.filter(
            Publication.title.ilike(f"%{query}%") |
            Publication.authors.ilike(f"%{query}%") |
            Publication.domain.ilike(f"%{query}%")
        )
    return q.all()


@router.get("/grants", response_model=List[GrantResponse])
def get_grants(
    query: Optional[str] = Query(None, description="Search keyword in title or funder_name"),
    db: Session = Depends(get_db)
):
    """Retrieves research grants from SQLite, optionally filtered by query."""
    q = db.query(Grant)
    if query:
        q = q.filter(
            Grant.title.ilike(f"%{query}%") |
            Grant.funder_name.ilike(f"%{query}%")
        )
    return q.all()


@router.get("/patents", response_model=List[PatentResponse])
def get_patents(
    query: Optional[str] = Query(None, description="Search keyword in title, assignee, or technology domain"),
    db: Session = Depends(get_db)
):
    """Retrieves patents from SQLite, optionally filtered by query."""
    q = db.query(Patent)
    if query:
        q = q.filter(
            Patent.title.ilike(f"%{query}%") |
            Patent.assignee.ilike(f"%{query}%") |
            Patent.technology_domain.ilike(f"%{query}%")
        )
    return q.all()


@router.post("/refresh")
def refresh_data():
    """Triggers the load_to_db ingestion pipeline on demand."""
    from ingestion.load_to_db import run_ingestion
    try:
        run_ingestion()
        return {"status": "success", "message": "Research data refreshed successfully."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
