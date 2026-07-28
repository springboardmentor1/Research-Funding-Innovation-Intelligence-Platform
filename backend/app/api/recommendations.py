from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.services import matching_service

from app.services.matching_service import get_matching_funding

from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationSummary,
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)

@router.get(
    "",
    response_model=list[RecommendationResponse],
    summary="Get Funding Recommendations",
    description=(
        "Returns personalized funding recommendations for the "
        "authenticated user based on their research profile. "
        "Each recommendation includes a match score, match level, "
        "reasons for the recommendation, and suggestions for "
        "improving eligibility."
    ),
    response_description="Funding recommendations retrieved successfully",
)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_matching_funding(
        db=db,
        user_id=current_user.id,
    )

@router.get(
    "/summary",
    response_model=RecommendationSummary,
    summary="Get Recommendation Summary",
    description=(
        "Returns a summary of the authenticated user's funding "
        "recommendations, including the number of high, medium, "
        "and low match opportunities."
    ),
    response_description="Recommendation summary retrieved successfully",
)
def recommendation_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return matching_service.get_recommendation_summary(
        db=db,
        user_id=current_user.id,
    )

@router.get(
    "/top",
    response_model=list[RecommendationResponse],
    summary="Get Top Funding Recommendations",
    description=(
        "Returns the highest-scoring funding recommendations. "
        "The number of results can be controlled using the 'limit' query parameter."
    ),
)
def get_top_recommendations(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return matching_service.get_top_recommendations(
        db=db,
        user_id=current_user.id,
        limit=limit,
    )