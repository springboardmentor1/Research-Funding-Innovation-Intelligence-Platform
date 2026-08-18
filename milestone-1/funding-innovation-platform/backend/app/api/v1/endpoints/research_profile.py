"""
Research Profile Management endpoints: create/view/update a researcher's
profile (domains, keywords, technology areas, organization, biography),
and attach publications and patents to it.
"""
import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.postgres import get_db
from app.models.user import User
from app.schemas.research_profile import (
    PatentCreate,
    PatentResponse,
    PublicationCreate,
    PublicationResponse,
    ResearchProfileCreate,
    ResearchProfileResponse,
    ResearchProfileUpdate,
)
from app.services.research_profile_service import ResearchProfileService

logger = logging.getLogger("app.api.research_profile")

router = APIRouter(prefix="/research-profile", tags=["Research Profile"])


@router.get("/me", response_model=ResearchProfileResponse)
def get_my_research_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve the authenticated user's research profile."""
    service = ResearchProfileService(db)
    return service.get_by_user(current_user)


@router.post("/me", response_model=ResearchProfileResponse, status_code=status.HTTP_201_CREATED)
def create_my_research_profile(
    payload: ResearchProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create the authenticated user's research profile (one per user)."""
    service = ResearchProfileService(db)
    return service.create_profile(current_user, payload)


@router.put("/me", response_model=ResearchProfileResponse)
def update_my_research_profile(
    payload: ResearchProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's research profile."""
    service = ResearchProfileService(db)
    return service.update_profile(current_user, payload)


@router.post(
    "/me/publications",
    response_model=PublicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_publication(
    payload: PublicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a publication to the authenticated user's research profile."""
    service = ResearchProfileService(db)
    return service.add_publication(current_user, payload)


@router.post(
    "/me/patents",
    response_model=PatentResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_patent(
    payload: PatentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a patent record to the authenticated user's research profile."""
    service = ResearchProfileService(db)
    return service.add_patent(current_user, payload)
