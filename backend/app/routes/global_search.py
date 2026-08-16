"""
Global publication and patent search endpoints.

Reads from the platform-wide `global_publications` and `global_patents` tables
populated by the ingestion system. Any authenticated user can search.

Routes:
  GET /global/publications          — paginated search of global publications
  GET /global/publications/{id}     — single publication by internal ID
  GET /global/patents               — paginated search of global patents
  GET /global/patents/{id}          — single patent by internal ID
"""
from typing import Optional, List
from datetime import date

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.connection import get_db
from app.services.auth_service import get_current_user
from app.models.user import User
from app.models.global_publication import GlobalPublication
from app.models.global_patent import GlobalPatent

router = APIRouter(prefix="/global", tags=["Global Search"])


# ---------------------------------------------------------------------------
# Pydantic response schemas
# ---------------------------------------------------------------------------

class PublicationOut(BaseModel):
    id: str
    external_id: str
    source: str
    doi: Optional[str]
    title: str
    abstract: Optional[str]
    authors: Optional[list]
    journal: Optional[str]
    publication_date: Optional[str]
    publication_year: Optional[int]
    citation_count: int
    open_access: Optional[str]
    url: Optional[str]
    topics: Optional[list]
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


class PatentOut(BaseModel):
    id: str
    external_id: str
    source: str
    patent_number: Optional[str]
    title: str
    abstract: Optional[str]
    inventors: Optional[list]
    assignee: Optional[str]
    filing_date: Optional[str]
    publication_date: Optional[str]
    url: Optional[str]
    classification: Optional[str]
    status: Optional[str]
    jurisdiction: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Publication endpoints
# ---------------------------------------------------------------------------

@router.get("/publications", response_model=List[PublicationOut])
def search_global_publications(
    keyword: Optional[str] = Query(None, description="Search in title, abstract, or journal"),
    source: Optional[str] = Query(None, description="Filter by source (e.g. openalex)"),
    year_from: Optional[int] = Query(None, description="Min publication year"),
    year_to: Optional[int] = Query(None, description="Max publication year"),
    author: Optional[str] = Query(None, description="Filter by author name (partial match)"),
    journal: Optional[str] = Query(None, description="Filter by journal name (partial match)"),
    min_citations: Optional[int] = Query(None, ge=0),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search the platform-wide global publications index.
    Supports full-text keyword search across title, abstract and journal,
    plus author, year range, source, and citation filters.
    """
    q = db.query(GlobalPublication)

    if keyword:
        q = q.filter(
            or_(
                GlobalPublication.title.ilike(f"%{keyword}%"),
                GlobalPublication.abstract.ilike(f"%{keyword}%"),
                GlobalPublication.journal.ilike(f"%{keyword}%"),
            )
        )
    if source:
        q = q.filter(GlobalPublication.source == source)
    if year_from is not None:
        q = q.filter(GlobalPublication.publication_year >= year_from)
    if year_to is not None:
        q = q.filter(GlobalPublication.publication_year <= year_to)
    if journal:
        q = q.filter(GlobalPublication.journal.ilike(f"%{journal}%"))
    if min_citations is not None:
        q = q.filter(GlobalPublication.citation_count >= min_citations)

    # Author search — cast JSON array to text for ILIKE matching
    if author:
        from sqlalchemy import Text, cast
        q = q.filter(cast(GlobalPublication.authors, Text).ilike(f"%{author}%"))

    pubs = (
        q.order_by(GlobalPublication.citation_count.desc())
         .offset((page - 1) * limit)
         .limit(limit)
         .all()
    )
    return [PublicationOut(**p.to_dict()) for p in pubs]


@router.get("/publications/{pub_id}", response_model=PublicationOut)
def get_global_publication(
    pub_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single global publication by its internal ID."""
    pub = db.query(GlobalPublication).filter(GlobalPublication.id == pub_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    return PublicationOut(**pub.to_dict())


# ---------------------------------------------------------------------------
# Patent endpoints
# ---------------------------------------------------------------------------

@router.get("/patents", response_model=List[PatentOut])
def search_global_patents(
    keyword: Optional[str] = Query(None, description="Search in title, abstract, or classification"),
    source: Optional[str] = Query(None, description="Filter by source (e.g. lens)"),
    status: Optional[str] = Query(None, description="Filter by status (GRANTED, FILED, etc.)"),
    jurisdiction: Optional[str] = Query(None, description="Filter by jurisdiction (e.g. US, EP)"),
    assignee: Optional[str] = Query(None, description="Filter by assignee name (partial match)"),
    inventor: Optional[str] = Query(None, description="Filter by inventor name (partial match)"),
    year_from: Optional[int] = Query(None, description="Min filing year"),
    year_to: Optional[int] = Query(None, description="Max filing year"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search the platform-wide global patent index.
    Supports keyword search, status, jurisdiction, assignee, inventor, and year range filters.
    """
    q = db.query(GlobalPatent)

    if keyword:
        q = q.filter(
            or_(
                GlobalPatent.title.ilike(f"%{keyword}%"),
                GlobalPatent.abstract.ilike(f"%{keyword}%"),
                GlobalPatent.classification.ilike(f"%{keyword}%"),
            )
        )
    if source:
        q = q.filter(GlobalPatent.source == source)
    if status:
        q = q.filter(GlobalPatent.status.ilike(status))
    if jurisdiction:
        q = q.filter(GlobalPatent.jurisdiction.ilike(f"%{jurisdiction}%"))
    if assignee:
        q = q.filter(GlobalPatent.assignee.ilike(f"%{assignee}%"))
    if year_from is not None:
        from sqlalchemy import extract
        q = q.filter(extract("year", GlobalPatent.filing_date) >= year_from)
    if year_to is not None:
        from sqlalchemy import extract
        q = q.filter(extract("year", GlobalPatent.filing_date) <= year_to)
    if inventor:
        from sqlalchemy import Text, cast
        q = q.filter(cast(GlobalPatent.inventors, Text).ilike(f"%{inventor}%"))

    patents = (
        q.order_by(GlobalPatent.filing_date.desc().nullslast())
         .offset((page - 1) * limit)
         .limit(limit)
         .all()
    )
    return [PatentOut(**p.to_dict()) for p in patents]


@router.get("/patents/{patent_id}", response_model=PatentOut)
def get_global_patent(
    patent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single global patent by its internal ID."""
    pat = db.query(GlobalPatent).filter(GlobalPatent.id == patent_id).first()
    if not pat:
        raise HTTPException(status_code=404, detail="Patent not found")
    return PatentOut(**pat.to_dict())
