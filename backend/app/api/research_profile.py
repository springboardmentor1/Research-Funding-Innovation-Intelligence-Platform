from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.schemas.research_profile import (
    ResearchProfileCreate,
    ResearchProfileUpdate,
    ResearchProfileResponse,
)

from app.services import research_profile_service

router = APIRouter(
    prefix="/research-profile",
    tags=["Research Profile"],
)


@router.post(
    "",
    response_model=ResearchProfileResponse,
    status_code=201,
)
def create_profile(
    profile_data: ResearchProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return research_profile_service.create_profile(
            db=db,
            user_id=current_user.id,
            profile_data=profile_data,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get(
    "/me",
    response_model=ResearchProfileResponse,
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = research_profile_service.get_profile(
        db=db,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found.",
        )

    return profile


@router.put(
    "/me",
    response_model=ResearchProfileResponse,
)
def update_my_profile(
    profile_data: ResearchProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = research_profile_service.get_profile(
        db=db,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found.",
        )

    return research_profile_service.update_profile(
        db=db,
        profile=profile,
        update_data=profile_data,
    )


@router.delete("/me")
def delete_my_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = research_profile_service.get_profile(
        db=db,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found.",
        )

    research_profile_service.delete_profile(
        db=db,
        profile=profile,
    )

    return {
        "message": "Research profile deleted successfully."
    }