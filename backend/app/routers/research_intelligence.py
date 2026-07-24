from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.oauth2 import get_current_user
from app.database.database import get_db

from app.models.funding import FundingOpportunity
from app.models.publication import Publication
from app.models.research_profile import ResearchProfile
from app.models.user import User
from app.models.user_funding import UserFunding

from app.schemas.research_intelligence import (
    ResearchDashboardResponse,
    PublicationTrendResponse
)

from app.services.recommendation_service import calculate_match_score

router = APIRouter(
    prefix="/research-intelligence",
    tags=["Research Intelligence"]
)


@router.get(
    "/dashboard",
    response_model=ResearchDashboardResponse
)
def research_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = (
        db.query(ResearchProfile)
        .filter(
            ResearchProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found"
        )

    # Calculate funding recommendations
    funding_list = db.query(FundingOpportunity).all()

    recommendation_count = 0

    for funding in funding_list:

        result = calculate_match_score(
            profile,
            funding
        )

        if result["score"] > 0:
            recommendation_count += 1

    # Publication trends
    trends = (
        db.query(
            Publication.publication_year,
            func.count(Publication.id)
        )
        .filter(
            Publication.user_id == current_user.id
        )
        .group_by(Publication.publication_year)
        .order_by(Publication.publication_year)
        .all()
    )

    publication_trends = [
        PublicationTrendResponse(
            year=year,
            publication_count=count
        )
        for year, count in trends
    ]

    # Saved grants
    saved = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.status == "Saved"
        )
        .count()
    )

    # Applied grants
    applied = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.status == "Applied"
        )
        .count()
    )

    # Total publications
    publication_count = (
        db.query(Publication)
        .filter(
            Publication.user_id == current_user.id
        )
        .count()
    )

    return ResearchDashboardResponse(
        researcher=current_user.full_name,
        research_domain=profile.research_domain,

        publication_count=publication_count,
        patent_count=profile.patent_count,

        saved_funding=saved,
        applied_funding=applied,

        total_recommendations=recommendation_count,

        publication_trends=publication_trends
    )