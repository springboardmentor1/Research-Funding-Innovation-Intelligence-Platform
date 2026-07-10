from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db.session import get_db
from ...schemas.data import (
    PublicationResponse, PatentResponse, GrantOpportunityResponse, DashboardStats
)
from ...crud.data import (
    get_publications, get_patents, get_grants, get_dashboard_stats
)
from ...dependencies import get_current_user
from ...models.user import User

router = APIRouter()


@router.get("/publications", response_model=List[PublicationResponse])
def read_publications(
    skip: int = 0,
    limit: int = 100,
    keyword: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_publications(db=db, skip=skip, limit=limit, keyword=keyword)


@router.get("/patents", response_model=List[PatentResponse])
def read_patents(
    skip: int = 0,
    limit: int = 100,
    keyword: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_patents(db=db, skip=skip, limit=limit, keyword=keyword)


@router.get("/grants", response_model=List[GrantOpportunityResponse])
def read_grants(
    skip: int = 0,
    limit: int = 100,
    keyword: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_grants(db=db, skip=skip, limit=limit, keyword=keyword)


@router.get("/dashboard-stats", response_model=DashboardStats)
def read_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_stats(db=db)
