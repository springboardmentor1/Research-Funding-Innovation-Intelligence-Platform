from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.schemas.recommendation import RecommendationResponse

from app.services.matching_service import get_matching_funding

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.get(
    "",
    response_model=list[RecommendationResponse],
)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_matching_funding(
        db=db,
        user_id=current_user.id,
    )