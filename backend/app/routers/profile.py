from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.oauth2 import get_current_user

from app.models.user import User
from app.models.research_profile import ResearchProfile

from app.schemas.research_profile import (
    ResearchProfileCreate,
    ResearchProfileUpdate
)

router = APIRouter(
    prefix="/api/profile",
    tags=["Research Profile"]
)


@router.post("/")
def create_profile(
    request: ResearchProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing = db.query(
        ResearchProfile
    ).filter(
        ResearchProfile.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    profile = ResearchProfile(
        user_id=current_user.id,
        research_domain=request.research_domain,
        keywords=request.keywords,
        technology_area=request.technology_area,
        biography=request.biography,
        experience_years=request.experience_years,
        publication_count=request.publication_count,
        patent_count=request.patent_count
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile

@router.get("/")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = db.query(
        ResearchProfile
    ).filter(
        ResearchProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile

@router.put("/")
def update_profile(
    request: ResearchProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = db.query(
        ResearchProfile
    ).filter(
        ResearchProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    profile.research_domain = request.research_domain
    profile.keywords = request.keywords
    profile.technology_area = request.technology_area
    profile.biography = request.biography
    profile.experience_years = request.experience_years

    db.commit()

    return profile

@router.delete("/")
def delete_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = db.query(
        ResearchProfile
    ).filter(
        ResearchProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    db.delete(profile)
    db.commit()

    return {
        "message": "Profile deleted successfully"
    }