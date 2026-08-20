"""
Research Trend Intelligence endpoints (Milestone 4). Read-only analytics
available to any authenticated user, mirroring patent_analysis.py and
technology_intelligence.py — no additional RBAC restriction beyond standard
authentication, since trend awareness benefits every role.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.postgres import get_db
from app.schemas.research_trend import (
    CitationAnalyticsSummary,
    DomainTrendEntry,
    EmergingTopicEntry,
    PublicationTrendPoint,
    ResearchHotspotEntry,
    ResearchTrendOverview,
    TopCitedPublicationEntry,
)
from app.services.research_trend_service import ResearchTrendService

router = APIRouter(
    prefix="/research-trends",
    tags=["Research Trend Intelligence"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/overview", response_model=ResearchTrendOverview)
def get_overview(db: Session = Depends(get_db)):
    """Composite payload (trend, emerging topics, hotspots, domain trends,
    citation analytics, top cited publications) for the dashboard page."""
    return ResearchTrendService(db).overview()


@router.get("/publication-trend", response_model=list[PublicationTrendPoint])
def get_publication_trend(db: Session = Depends(get_db)):
    """Publication count and total citations per year, platform-wide."""
    return ResearchTrendService(db).publication_trend()


@router.get("/emerging-topics", response_model=list[EmergingTopicEntry])
def get_emerging_topics(limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)):
    """Research domains/keywords with the fastest recent publication growth."""
    return ResearchTrendService(db).emerging_topics(limit=limit)


@router.get("/hotspots", response_model=list[ResearchHotspotEntry])
def get_research_hotspots(limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)):
    """Research domains ranked by current publication activity."""
    return ResearchTrendService(db).research_hotspots(limit=limit)


@router.get("/domain-trends", response_model=list[DomainTrendEntry])
def get_domain_trends(db: Session = Depends(get_db)):
    """Recent vs. prior publication counts and growth rate for every research domain."""
    return ResearchTrendService(db).domain_trends()


@router.get("/citation-analytics", response_model=CitationAnalyticsSummary)
def get_citation_analytics(db: Session = Depends(get_db)):
    """Platform-wide publication citation summary statistics."""
    return ResearchTrendService(db).citation_analytics()


@router.get("/top-cited", response_model=list[TopCitedPublicationEntry])
def get_top_cited_publications(limit: int = Query(default=10, ge=1, le=50), db: Session = Depends(get_db)):
    """The most-cited publications platform-wide."""
    return ResearchTrendService(db).top_cited_publications(limit=limit)
