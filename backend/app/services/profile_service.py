from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.profile import ResearchProfile
from app.schemas.profile import ProfileCreate, ProfileUpdate

def create_profile(db: Session, profile_data: ProfileCreate, user_id: str) -> ResearchProfile:
    # Check if user already has a profile
    existing_profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Research profile already exists for this user"
        )

    db_profile = ResearchProfile(
        user_id=user_id,
        research_domain=profile_data.research_domain,
        research_subdomain=profile_data.research_subdomain,
        keywords=profile_data.keywords,
        organization=profile_data.organization,
        designation=profile_data.designation,
        highest_qualification=profile_data.highest_qualification,
        years_of_experience=profile_data.years_of_experience,
        research_interests=profile_data.research_interests,
        technology_areas=profile_data.technology_areas,
        publications_count=profile_data.publications_count,
        patents_count=profile_data.patents_count,
        biography=profile_data.biography,
        linkedin_url=profile_data.linkedin_url,
        orcid_id=profile_data.orcid_id
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_profile_by_user(db: Session, user_id: str) -> ResearchProfile:
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found"
        )
    return profile

def update_profile(db: Session, profile_data: ProfileUpdate, user_id: str) -> ResearchProfile:
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found"
        )

    # Partial updates
    update_dict = profile_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile

def delete_profile(db: Session, user_id: str) -> dict:
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found"
        )
    db.delete(profile)
    db.commit()
    return {"message": "Research profile deleted successfully"}
