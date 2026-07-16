from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.auth.jwt_bearer import get_current_user
from app.auth.role_checker import require_role
from app.models.research_profile import ResearchProfile
from app.schemas.research_profile import ResearchProfileCreate
from app.models.publication import Publication
from app.schemas.publication import PublicationCreate
from app.models.patent import Patent
from app.schemas.patent import PatentCreate
from app.services.openalex_service import search_publications

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister
from app.schemas.login import UserLogin
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter()


@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }
@router.get("/profile")
def profile(current_user=Depends(get_current_user)):
    return {
        "message": "Protected Route",
        "user": current_user
    }

@router.get("/researcher/dashboard")
def researcher_dashboard(
    current_user=Depends(require_role("Researcher"))
):
    return {
        "message": "Welcome Researcher",
        "user": current_user
    }

@router.post("/research-profile")
def create_research_profile(
    profile: ResearchProfileCreate,
    current_user=Depends(require_role("Researcher")),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == current_user["email"]
    ).first()

    new_profile = ResearchProfile(
        user_id=user.id,
        research_domain=profile.research_domain,
        keywords=profile.keywords,
        organization=profile.organization,
        biography=profile.biography
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "message": "Research profile created successfully"
    }

@router.post("/publication")
def create_publication(
    publication: PublicationCreate,
    current_user=Depends(require_role("Researcher")),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == current_user["email"]
    ).first()

    profile = db.query(ResearchProfile).filter(
        ResearchProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found"
        )

    new_publication = Publication(
        profile_id=profile.id,
        title=publication.title,
        authors=publication.authors,
        year=publication.year,
        source=publication.source
    )

    db.add(new_publication)
    db.commit()
    db.refresh(new_publication)

    return {
        "message": "Publication added successfully"
    }

@router.post("/patent")
def create_patent(
    patent: PatentCreate,
    current_user=Depends(require_role("Researcher")),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == current_user["email"]
    ).first()

    profile = db.query(ResearchProfile).filter(
        ResearchProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found"
        )

    new_patent = Patent(
        profile_id=profile.id,
        title=patent.title,
        patent_number=patent.patent_number,
        filing_year=patent.filing_year,
        status=patent.status
    )

    db.add(new_patent)
    db.commit()
    db.refresh(new_patent)

    return {
        "message": "Patent added successfully"
    }

@router.get("/search-publications")
def search_openalex_publications(
    query: str,
    current_user=Depends(require_role("Researcher"))
):
    return search_publications(query)