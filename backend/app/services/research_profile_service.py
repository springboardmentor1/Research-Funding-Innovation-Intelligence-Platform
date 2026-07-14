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