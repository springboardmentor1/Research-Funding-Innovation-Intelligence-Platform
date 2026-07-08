from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.services import patent_service
from app.services.auth_service import get_current_user
from app.schemas.patent import PatentResponse
from app.models.user import User

router = APIRouter(prefix="/patents", tags=["Patent Management"])

@router.get("/search", response_model=List[PatentResponse])
def search_and_sync_patents(
    limit: int = Query(10, ge=1, le=100),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search and synchronize patent records from The Lens API (or mock generator fallback)
    using the authenticated user's Research Profile search context.
    """
    return patent_service.fetch_and_sync_patents(db, str(current_user.id), limit, page)

@router.get("", response_model=List[PatentResponse])
def get_my_patents(
    tech_domain: Optional[str] = Query(None, description="Filter by technology domain"),
    year: Optional[int] = Query(None, description="Filter by filing year"),
    status: Optional[str] = Query(None, description="Filter by patent status (e.g. GRANTED, FILED)"),
    inventor: Optional[str] = Query(None, description="Filter by inventor name"),
    keyword: Optional[str] = Query(None, description="Search in title, abstract, or classification"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve stored patents for the authenticated user.
    Supports filtering by technology domain, filing year, patent status, inventor, and keyword.
    """
    return patent_service.get_user_patents(
        db, str(current_user.id), tech_domain, year, status, inventor, keyword
    )

@router.get("/{patent_id}", response_model=PatentResponse)
def get_patent(
    patent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve detailed metadata for a specific saved patent by ID.
    """
    return patent_service.get_patent_by_id(db, patent_id, str(current_user.id))
