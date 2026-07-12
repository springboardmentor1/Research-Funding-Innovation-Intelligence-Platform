from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.schemas import User, Profile

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles"])


class ProfileUpsert(BaseModel):
    organization: Optional[str] = None
    department: Optional[str] = None
    research_domains: list[str] = []
    keywords: list[str] = []
    bio: Optional[str] = None
    orcid_id: Optional[str] = None


class ProfileResponse(ProfileUpsert):
    id: str
    user_id: str

    class Config:
        from_attributes = True


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.profile:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
    p = current_user.profile
    return ProfileResponse(
        id=str(p.id), user_id=str(p.user_id),
        organization=p.organization, department=p.department,
        research_domains=p.research_domains or [],
        keywords=p.keywords or [], bio=p.bio, orcid_id=p.orcid_id,
    )


@router.put("/me", response_model=ProfileResponse)
def upsert_my_profile(
    payload: ProfileUpsert,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return ProfileResponse(
        id=str(profile.id), user_id=str(profile.user_id),
        organization=profile.organization, department=profile.department,
        research_domains=profile.research_domains or [],
        keywords=profile.keywords or [], bio=profile.bio, orcid_id=profile.orcid_id,
    )