from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.recommendations import GrantRecommendationResponse, GrantMatchBreakdownResponse
from app.services import recommendations as recommendation_service

router = APIRouter(tags=["Funding Recommendations"])

@router.get("/grants", response_model=list[GrantRecommendationResponse])
def get_user_grant_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch personalized grant recommendations sorted by matching score for the current user's profile."""
    return recommendation_service.get_recommendations_for_user(db, current_user.id)

@router.get("/grants/{grant_id}/match", response_model=GrantMatchBreakdownResponse)
def get_single_grant_match(
    grant_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve detailed matching diagnostics (overlap fields and explanation) for a specific grant."""
    return recommendation_service.get_match_breakdown(db, current_user.id, grant_id)
