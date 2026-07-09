from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.user import User
from app.schemas.user import UserRole
from app.schemas.profile import (
    ResearchProfileCreate,
    ResearchProfileUpdate,
    ResearchProfileResponse,
    PublicationCreate,
    PublicationResponse,
    PatentCreate,
    PatentResponse
)
from app.services import profile as profile_service

router = APIRouter(tags=["Research Profiles"])

@router.post("/", response_model=ResearchProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_in: ResearchProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a research profile for the logged-in user."""
    return profile_service.create_research_profile(db, current_user.id, profile_in)

@router.get("/me", response_model=ResearchProfileResponse)
def read_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch the current authenticated user's research profile."""
    profile = profile_service.get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found. Please create one."
        )
    return profile

@router.put("/me", response_model=ResearchProfileResponse)
def update_my_profile(
    profile_in: ResearchProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current authenticated user's research profile."""
    return profile_service.update_research_profile(db, current_user.id, profile_in)

@router.post("/me/publications", response_model=PublicationResponse, status_code=status.HTTP_201_CREATED)
def add_my_publication(
    pub_in: PublicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a publication to the current user's research profile."""
    return profile_service.add_publication(db, current_user.id, pub_in)

@router.post("/me/patents", response_model=PatentResponse, status_code=status.HTTP_201_CREATED)
def add_my_patent(
    patent_in: PatentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a patent to the current user's research profile."""
    return profile_service.add_patent(db, current_user.id, patent_in)

@router.get("/", response_model=list[ResearchProfileResponse])
def search_profiles(
    organization: str | None = None,
    domain: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search and list all profiles. Query parameters organization and domain can be used for filtering.
    Only accessible to authenticated users.
    """
    from app.models.profile import ResearchProfile
    query = db.query(ResearchProfile)
    
    if organization:
        query = query.filter(ResearchProfile.organization.ilike(f"%{organization}%"))
    if domain:
        # PostgreSQL JSON path query search or pythonic check if postgres is not used.
        # To remain database-agnostic in SQLAlchemy query for JSON list:
        # We can cast/check elements in JSON. A safe, simple way is:
        query = query.filter(ResearchProfile.research_domains.cast(str).ilike(f"%{domain}%"))
        
    return query.all()

@router.get("/{profile_id}", response_model=ResearchProfileResponse)
def read_profile_by_id(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch a research profile by its profile ID."""
    profile = profile_service.get_profile_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research profile with ID {profile_id} not found."
        )
    return profile
