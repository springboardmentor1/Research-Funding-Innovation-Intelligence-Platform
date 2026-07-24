from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.intelligence import (
    PublicationTimelineResponse,
    TrendingTopicResponse,
    CollaboratorResponse,
    PatentLandscapeResponse,
    EmergingTechnologyResponse,
    InnovationScoreResponse
)
from app.services import intelligence as intelligence_service

router = APIRouter(tags=["Research & Patent Intelligence"])

@router.get("/trends/publications", response_model=list[PublicationTimelineResponse])
def get_pub_timeline(
    current_user: User = Depends(get_current_user)
):
    """Retrieve yearly research publication volumes."""
    return intelligence_service.get_publication_timeline()

@router.get("/trends/topics", response_model=list[TrendingTopicResponse])
def get_trending_research_topics(
    current_user: User = Depends(get_current_user)
):
    """Retrieve trending keywords/domains with calculated velocity growth indicators."""
    return intelligence_service.get_trending_topics()

@router.get("/trends/collaborators", response_model=list[CollaboratorResponse])
def get_recommended_collaborators(
    current_user: User = Depends(get_current_user)
):
    """Retrieve list of top researchers and active scientific fields."""
    return intelligence_service.get_top_collaborators()

@router.get("/patents/landscape", response_model=list[PatentLandscapeResponse])
def get_patent_classification_landscape(
    current_user: User = Depends(get_current_user)
):
    """Analyze classifications of patent filings to build landscape distribution counts."""
    return intelligence_service.get_patent_landscape()

@router.get("/patents/emerging-tech", response_model=list[EmergingTechnologyResponse])
def get_recommended_emerging_technologies(
    current_user: User = Depends(get_current_user)
):
    """Scan filing trends and recommend high-growth emerging technologies."""
    return intelligence_service.get_emerging_technologies()

@router.get("/patents/{patent_number}/innovation-score", response_model=InnovationScoreResponse)
def get_patent_innovation_score_diagnostics(
    patent_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve custom innovation score, citation growth, and commercialization recommendations for a patent."""
    return intelligence_service.calculate_patent_innovation_score(db, patent_number)
