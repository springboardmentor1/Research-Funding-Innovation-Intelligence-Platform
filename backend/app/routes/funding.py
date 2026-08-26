from typing import List, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services import funding_service
from app.services.auth_service import get_current_user
from app.models.user import User
from app.schemas.funding import FundingRecommendationResponse
from pydantic import BaseModel

class RecommendationListResponse(BaseModel):
    recommendations: List[FundingRecommendationResponse]

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/funding", tags=["Funding Opportunity Recommendations"])

@router.get("/recommendations", response_model=RecommendationListResponse)
def get_recommendations(
    country: Optional[str] = Query(None, description="Filter recommendations by country"),
    funding_type: Optional[str] = Query(None, description="Filter recommendations by funding type"),
    minimum_match_score: Optional[float] = Query(None, description="Filter recommendations by minimum match score (0-100 or 0-1)"),
    limit: int = Query(10, ge=1, le=50, description="Limit output recommendations count"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve ranked, explainable funding opportunity recommendations for the currently logged-in user.
    Requires JWT authentication.
    """
    logger.info(
        "Funding recommendations requested: user_id=%s limit=%d country=%s funding_type=%s",
        current_user.id, limit, country, funding_type
    )
    try:
        recommendations = funding_service.get_personalized_recommendations(
            db=db,
            user_id=current_user.id,
            country=country,
            funding_type=funding_type,
            minimum_match_score=minimum_match_score,
            limit=limit
        )
        logger.info("Returning %d recommendations for user_id=%s", len(recommendations), current_user.id)
        return {"recommendations": recommendations}
    except ValueError as e:
        logger.warning("Funding recommendations ValueError for user_id=%s: %s", current_user.id, str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found for current user. Please complete your Research Profile first."
        )
    except Exception as e:
        logger.exception("Unexpected error in funding recommendations for user_id=%s", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating recommendations: {str(e)}"
        )
