"""
Commercialization Recommendation endpoints (Milestone 3). Self-service
generation/listing/dismissal for any authenticated user with a research
profile; cross-profile lookup restricted to Administrators/Innovation
Managers.

Static-path routes (/me, /me/generate) are registered before the dynamic
/profile/{profile_id} route, and /{recommendation_id}/dismiss uses a
distinct trailing segment so there's no ambiguity with /me.
"""
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.postgres import get_db
from app.models.user import User
from app.schemas.commercialization import CommercializationRecommendationResponse
from app.schemas.common import PaginatedResponse
from app.services.commercialization_service import CommercializationService

router = APIRouter(
    prefix="/commercialization",
    tags=["Commercialization Recommendations"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/me", response_model=PaginatedResponse[CommercializationRecommendationResponse])
def list_my_recommendations(
    include_dismissed: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the caller's commercialization recommendations, newest first."""
    service = CommercializationService(db)
    return service.list_for_user(current_user, include_dismissed=include_dismissed, page=page, page_size=page_size)


@router.post(
    "/me/generate",
    response_model=list[CommercializationRecommendationResponse],
    status_code=status.HTTP_201_CREATED,
)
def generate_my_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate fresh commercialization recommendations from the caller's
    latest innovation score. May return an empty list if no rule's
    thresholds are currently met — this is expected, not an error."""
    service = CommercializationService(db)
    return service.generate_for_user(current_user)


@router.patch("/{recommendation_id}/dismiss", response_model=CommercializationRecommendationResponse)
def dismiss_recommendation(
    recommendation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dismiss a recommendation (owner only). Dismissed recommendations are
    kept, not deleted, and excluded from the default /me listing."""
    service = CommercializationService(db)
    return service.dismiss(current_user, recommendation_id)


@router.get("/profile/{profile_id}", response_model=PaginatedResponse[CommercializationRecommendationResponse])
def list_recommendations_for_profile(
    profile_id: uuid.UUID,
    include_dismissed: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """[Administrator / Innovation Manager] View any research profile's commercialization recommendations."""
    service = CommercializationService(db)
    return service.list_for_profile(current_user, profile_id, include_dismissed=include_dismissed, page=page, page_size=page_size)
