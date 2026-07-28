from sqlalchemy.orm import Session

from app.models.research_profile import ResearchProfile
from app.schemas.research_profile import (
    ResearchProfileCreate,
    ResearchProfileUpdate,
)


def create_profile(
    db: Session,
    user_id: int,
    profile_data: ResearchProfileCreate,
):
    existing_profile = (
        db.query(ResearchProfile)
        .filter(ResearchProfile.user_id == user_id)
        .first()
    )

    if existing_profile:
        raise ValueError("Research profile already exists.")

    profile = ResearchProfile(
        user_id=user_id,
        **profile_data.model_dump()
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def get_profile(
    db: Session,
    user_id: int,
):
    return (
        db.query(ResearchProfile)
        .filter(ResearchProfile.user_id == user_id)
        .first()
    )


def update_profile(
    db: Session,
    profile: ResearchProfile,
    update_data: ResearchProfileUpdate,
):
    data = update_data.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    return profile


def delete_profile(
    db: Session,
    profile: ResearchProfile,
):
    db.delete(profile)
    db.commit()

def get_profile_completion(
    db: Session,
    user_id: int,
):
    profile = (
        db.query(ResearchProfile)
        .filter(ResearchProfile.user_id == user_id)
        .first()
    )

    if not profile:
        return {
            "completion_percentage": 0,
            "completed_fields": 0,
            "total_fields": 5,
            "missing_fields": [
                "research_area",
                "institution",
                "designation",
                "experience_years",
                "bio",
            ],
        }

    fields = {
        "research_area": profile.research_area,
        "institution": profile.institution,
        "designation": profile.designation,
        "experience_years": profile.experience_years,
        "bio": profile.bio,
    }

    completed_fields = 0
    missing_fields = []

    for field_name, value in fields.items():
        if value not in (None, ""):
            completed_fields += 1
        else:
            missing_fields.append(field_name)

    total_fields = len(fields)

    completion_percentage = int(
        (completed_fields / total_fields) * 100
    )

    return {
        "completion_percentage": completion_percentage,
        "completed_fields": completed_fields,
        "total_fields": total_fields,
        "missing_fields": missing_fields,
    }