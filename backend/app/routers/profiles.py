"""
Research profile management.

    POST  /api/v1/profiles/me    create my profile
    GET   /api/v1/profiles/me    read my profile
    PATCH /api/v1/profiles/me    update my profile

Note every route is "/me". The profile id never appears in the URL, so a
user cannot request or modify someone else's profile by guessing a number.
The identity comes from the JWT, not from the path.

That class of bug - Insecure Direct Object Reference - is one of the most
common real-world API vulnerabilities. Designing the id out of the URL
removes it entirely rather than relying on remembering an ownership check.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentUser
from app.models import ResearchProfile
from app.schemas import ProfileCreate, ProfileRead, ProfileUpdate

router = APIRouter(prefix="/profiles", tags=["profiles"])


def _get_own(db: Session, user_id: int) -> ResearchProfile | None:
    return db.scalar(
        select(ResearchProfile).where(ResearchProfile.user_id == user_id)
    )


@router.post("/me", response_model=ProfileRead,
             status_code=status.HTTP_201_CREATED)
def create_profile(payload: ProfileCreate, user: CurrentUser,
                   db: Annotated[Session, Depends(get_db)]):
    if _get_own(db, user.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists - use PATCH to update it",
        )

    profile = ResearchProfile(user_id=user.id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/me", response_model=ProfileRead)
def read_profile(user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    profile = _get_own(db, user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile yet - create one with POST /profiles/me",
        )
    return profile


@router.patch("/me", response_model=ProfileRead)
def update_profile(payload: ProfileUpdate, user: CurrentUser,
                   db: Annotated[Session, Depends(get_db)]):
    profile = _get_own(db, user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No profile yet")

    # exclude_unset is the difference between PATCH and PUT. Without it,
    # every field the client omitted would arrive as None and wipe stored
    # data. With it, only fields actually present in the request body are
    # applied.
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile
