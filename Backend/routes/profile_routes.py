from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from auth.auth import get_current_user
from models.user import User
from schemas.profile_schema import ProfileUpdate, ProfileResponse
from services.profile_service import get_profile_by_user_id, update_profile

router = APIRouter(tags=["Research Profiles"])

@router.get("/profile", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Retrieves the research profile for the currently logged-in user."""
    return get_profile_by_user_id(db, current_user.id)


@router.post("/profile", response_model=ProfileResponse)
def update_my_profile(
    update_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates research profile fields (domains, keywords, etc.)."""
    return update_profile(db, current_user.id, update_data)
