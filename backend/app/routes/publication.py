from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.services import publication_service
from app.services.auth_service import get_current_user
from app.schemas.publication import PublicationResponse
from app.models.user import User

router = APIRouter(prefix="/publications", tags=["Publication Management"])

@router.get("/search", response_model=List[PublicationResponse])
def search_and_sync_openalex(
    limit: int = Query(10, ge=1, le=100),
    page: int = Query(1, ge=1),
    keyword: Optional[str] = Query(None, description="Optional keyword to search OpenAlex"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search and synchronize academic publications from the OpenAlex API 
    using the authenticated user's Research Profile search context or explicit search keyword.
    """
    return publication_service.fetch_and_sync_publications(db, str(current_user.id), limit, page, keyword)

@router.get("", response_model=List[PublicationResponse])
def get_my_publications(
    domain: Optional[str] = Query(None, description="Filter by user's research domain"),
    year: Optional[int] = Query(None, description="Filter by publication year"),
    min_citations: Optional[int] = Query(None, description="Filter by minimum citation count"),
    keyword: Optional[str] = Query(None, description="Search in title, abstract, or keywords"),
    auto_sync: bool = Query(False, description="Auto-sync from OpenAlex if 0 stored publications match"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve stored publications for the authenticated user.
    Supports filtering by research domain, year, citation count, and title/keyword.
    """
    return publication_service.get_user_publications(
        db, str(current_user.id), domain, year, min_citations, keyword, auto_sync
    )

@router.get("/{publication_id}", response_model=PublicationResponse)
def get_publication(
    publication_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve detailed metadata for a specific saved publication by ID.
    """
    return publication_service.get_publication_by_id(db, publication_id, str(current_user.id))
