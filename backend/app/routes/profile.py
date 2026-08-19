from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services import profile_service
from app.services.auth_service import get_current_user
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.models.user import User

router = APIRouter(prefix="/profile", tags=["Research Profile Management"])

@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_my_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a research profile for the authenticated user.
    Each user can only have one profile.
    """
    return profile_service.create_profile(db, profile_data, str(current_user.id))

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the current user's research profile.
    """
    return profile_service.get_profile_by_user(db, str(current_user.id))

@router.put("", response_model=ProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Partially update fields in the current user's research profile.
    """
    return profile_service.update_profile(db, profile_data, str(current_user.id))

@router.delete("", status_code=status.HTTP_200_OK)
def delete_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete the current user's research profile.
    """
    return profile_service.delete_profile(db, str(current_user.id))
