from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.schemas.research_profile import (
    ResearchProfileCreate,
    ResearchProfileUpdate,
    ResearchProfileResponse,
    ProfileCompletionResponse,
)

from app.services import research_profile_service

router = APIRouter(
    prefix="/research-profile",
    tags=["Research Profile"],
)


@router.post(
    "",
    response_model=ResearchProfileResponse,
    summary="Create Research Profile",
    description=(
        "Creates a research profile for the authenticated user."
    ),
    response_description="Research profile created successfully",
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
    summary="Get My Research Profile",
    description=(
        "Returns the authenticated user's research profile."
    ),
    response_description="Research profile retrieved successfully",
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
    summary="Update Research Profile",
    description=(
        "Updates the authenticated user's research profile."
    ),
    response_description="Research profile updated successfully",
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

@router.get(
    "/completion",
    response_model=ProfileCompletionResponse,
    summary="Get Research Profile Completion",
    description=(
        "Returns the completion percentage of the authenticated user's "
        "research profile along with completed and missing fields."
    ),
)
def get_completion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return research_profile_service.get_profile_completion(
        db=db,
        user_id=current_user.id,
    )

@router.delete(
    "/me",
    summary="Delete Research Profile",
    description=(
        "Deletes the authenticated user's research profile."
    ),
    response_description="Research profile deleted successfully",
)
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