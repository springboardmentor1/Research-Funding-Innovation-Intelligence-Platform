from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import Profile, User
from profile.schemas import ProfileCreate, ProfileUpdate, ProfileResponse

router = APIRouter(prefix="/profile", tags=["Research Profile"])


@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(profile_data: ProfileCreate, db: Session = Depends(get_db)):
    """Create or update a research profile for a user."""
    # Validate user exists
    user = db.query(User).filter(User.id == profile_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {profile_data.user_id} not found"
        )

    # Check if profile already exists — update instead
    existing = db.query(Profile).filter(Profile.user_id == profile_data.user_id).first()
    if existing:
        for field, value in profile_data.model_dump(exclude={"user_id"}).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    profile = Profile(**profile_data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    """Get the research profile for a specific user."""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No profile found for user_id {user_id}"
        )
    return profile


@router.put("/{user_id}", response_model=ProfileResponse)
def update_profile(user_id: int, update_data: ProfileUpdate, db: Session = Depends(get_db)):
    """Partially update a research profile."""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No profile found for user_id {user_id}"
        )
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
