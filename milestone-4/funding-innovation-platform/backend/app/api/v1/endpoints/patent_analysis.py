"""
Patent Landscape Analysis endpoints (Milestone 3). Read-only analytics
available to any authenticated user — patent landscape awareness benefits
researchers, startup founders, and innovation managers alike, so no
additional RBAC restriction is applied beyond standard authentication.
"""
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.postgres import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.patent_analysis import (
    CompetitorAnalysisEntry,
    InnovationMapEntry,
    PatentClusterGroup,
    PatentSearchParams,
    PatentSearchResult,
    PatentTrendPoint,
)
from app.services.patent_analysis_service import PatentAnalysisService

router = APIRouter(
    prefix="/patent-analysis",
    tags=["Patent Landscape Analysis"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/search", response_model=PaginatedResponse[PatentSearchResult])
def search_patents(
    q: str | None = Query(default=None),
    assignee: str | None = Query(default=None),
    technology_domain: str | None = Query(default=None),
    classification: str | None = Query(default=None),
    filed_after: date | None = Query(default=None),
    filed_before: date | None = Query(default=None),
    sort_by: str = Query(default="filing_date"),
    sort_dir: str = Query(default="desc"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search patents platform-wide with filters (assignee, technology
    domain, classification, filing date range) and free-text query."""
    params = PatentSearchParams(
        q=q,
        assignee=assignee,
        technology_domain=technology_domain,
        classification=classification,
        filed_after=filed_after,
        filed_before=filed_before,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    service = PatentAnalysisService(db)
    return service.search(params, page=page, page_size=page_size)


@router.get("/trend", response_model=list[PatentTrendPoint])
def get_patent_trend(db: Session = Depends(get_db)):
    """Patent filing count and total citations per year, platform-wide."""
    service = PatentAnalysisService(db)
    return service.trend()


@router.get("/clusters", response_model=list[PatentClusterGroup])
def get_patent_clusters(limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)):
    """Patents grouped by (classification, technology domain), ranked by cluster size."""
    service = PatentAnalysisService(db)
    return service.clusters(limit=limit)


@router.get("/competitors", response_model=list[CompetitorAnalysisEntry])
def get_competitor_analysis(limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)):
    """Patent assignees ranked by portfolio size, with total citations and technology domains covered."""
    service = PatentAnalysisService(db)
    return service.competitors(limit=limit)


@router.get("/innovation-map", response_model=list[InnovationMapEntry])
def get_innovation_map(db: Session = Depends(get_db)):
    """Technology domain x classification cross-tabulation for visualizing innovation concentration."""
    service = PatentAnalysisService(db)
    return service.innovation_map()
