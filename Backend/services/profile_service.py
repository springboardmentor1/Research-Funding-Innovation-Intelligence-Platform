from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.profile import ResearchProfile
from schemas.profile_schema import ProfileUpdate

def get_profile_by_user_id(db: Session, user_id: int):
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )
    return profile


def update_profile(db: Session, user_id: int, data: ProfileUpdate):
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    profile.bio = data.bio
    profile.organization = data.organization
    profile.department = data.department
    profile.h_index = data.h_index
    profile.total_citations = data.total_citations
    
    # Using sqlalchemy setters
    profile.research_domains = data.research_domains
    profile.keywords = data.keywords
    
    if data.career_stage is not None:
        profile.career_stage = data.career_stage
    if data.institution_type is not None:
        profile.institution_type = data.institution_type
    if data.region is not None:
        profile.region = data.region

    db.commit()
    db.refresh(profile)
    return profile
