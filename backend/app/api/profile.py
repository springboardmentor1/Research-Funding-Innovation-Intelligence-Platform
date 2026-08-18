from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import UserResponse, ProfileUpdate
from app.api.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("/", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/", response_model=UserResponse)
def update_profile(
    profile_in: ProfileUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.organization is not None:
        current_user.organization = profile_in.organization
    if profile_in.research_domain is not None:
        current_user.research_domain = profile_in.research_domain
    if profile_in.keywords is not None:
        current_user.keywords = profile_in.keywords
    if profile_in.research_interests is not None:
        current_user.research_interests = profile_in.research_interests
        
    db.commit()
    db.refresh(current_user)
    return current_user
