"""
Innovation Scoring Engine endpoints (Milestone 3). Self-service score
viewing/recomputation for any authenticated user with a research profile;
viewing another profile's score or the leaderboard has its own rules below.
"""
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.postgres import get_db
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.innovation_score import InnovationScoreLeaderboardEntry, InnovationScoreResponse
from app.services.innovation_scoring_service import InnovationScoringService

router = APIRouter(
    prefix="/innovation-score",
    tags=["Innovation Scoring Engine"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/me", response_model=InnovationScoreResponse)
def get_my_innovation_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the authenticated user's latest innovation score, computing one
    on first access if none exists yet."""
    service = InnovationScoringService(db)
    return service.get_latest_for_user(current_user)


@router.post("/me/recompute", response_model=InnovationScoreResponse)
def recompute_my_innovation_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Recompute and store a fresh snapshot of the authenticated user's
    innovation score, reflecting any profile/patent/application changes
    since the last computation."""
    service = InnovationScoringService(db)
    return service.recompute_for_user(current_user)


@router.get("/me/history", response_model=PaginatedResponse[InnovationScoreResponse])
def get_my_innovation_score_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Paginated history of the authenticated user's innovation score snapshots, newest first."""
    service = InnovationScoringService(db)
    return service.get_history_for_user(current_user, page=page, page_size=page_size)


@router.get("/leaderboard", response_model=list[InnovationScoreLeaderboardEntry])
def get_innovation_score_leaderboard(
    limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)
):
    """Top research profiles ranked by latest overall innovation score."""
    service = InnovationScoringService(db)
    return service.leaderboard(limit=limit)


@router.get("/profile/{profile_id}", response_model=InnovationScoreResponse)
def get_innovation_score_for_profile(
    profile_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """[Administrator / Innovation Manager] View any research profile's latest innovation score."""
    service = InnovationScoringService(db)
    return service.get_latest_for_profile(current_user, profile_id)
