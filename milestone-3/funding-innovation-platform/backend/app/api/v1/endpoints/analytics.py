"""Admin-only analytics endpoints powering the Admin Dashboard."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.postgres import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/admin/analytics", tags=["Admin Analytics"], dependencies=[Depends(require_admin)])


@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)) -> dict:
    """[Administrator] Aggregate platform counts: users by role, opportunities
    by status, applications by status, total bookmarks."""
    service = AnalyticsService(db)
    return service.overview()


@router.get("/applications-trend")
def get_applications_trend(days: int = Query(default=30, ge=1, le=365), db: Session = Depends(get_db)) -> list[dict]:
    """[Administrator] Daily application submission counts for the last N days."""
    service = AnalyticsService(db)
    return service.applications_trend(days=days)


@router.get("/top-research-domains")
def get_top_research_domains(limit: int = Query(default=10, ge=1, le=50), db: Session = Depends(get_db)) -> list[dict]:
    """[Administrator] Most common research domains across funding opportunities."""
    service = AnalyticsService(db)
    return service.top_research_domains(limit=limit)
