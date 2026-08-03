from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.auth.jwt_bearer import get_current_user
from app.auth.role_checker import require_role
from app.database import get_db
from app.models.user import User
from app.models.research_profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent
from app.schemas.user import UserRegister
from app.schemas.research_profile import ResearchProfileCreate
from app.schemas.publication import PublicationCreate
from app.schemas.patent import PatentCreate
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter()

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
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

    if not db_user or not verify_password(form_data.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
            "name": db_user.full_name
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/profile")
def profile(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user.id).first()
    publications = []
    patents = []
    
    if profile:
        publications = db.query(Publication).filter(Publication.profile_id == profile.id).all()
        patents = db.query(Patent).filter(Patent.profile_id == profile.id).all()
        
    return {
        "user": {
            "email": user.email,
            "role": user.role,
            "name": user.full_name,
            "id": user.id
        },
        "profile": {
            "id": profile.id if profile else None,
            "research_domain": profile.research_domain if profile else "",
            "keywords": profile.keywords if profile else "",
            "organization": profile.organization if profile else "",
            "biography": profile.biography if profile else "",
            "publications": [
                {
                    "title": p.title,
                    "authors": p.authors,
                    "year": p.year,
                    "source": p.source
                } for p in publications
            ],
            "patents": [
                {
                    "title": pat.title,
                    "patent_number": pat.patent_number,
                    "filing_year": pat.filing_year,
                    "status": pat.status
                } for pat in patents
            ]
        }
    }

@router.post("/research-profile")
def create_research_profile(
    profile: ResearchProfileCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing_profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user.id).first()
    
    if existing_profile:
        existing_profile.research_domain = profile.research_domain
        existing_profile.keywords = profile.keywords
        existing_profile.organization = profile.organization
        existing_profile.biography = profile.biography
        db.commit()
        return {"message": "Research profile updated successfully"}
    
    new_profile = ResearchProfile(
        user_id=user.id,
        research_domain=profile.research_domain,
        keywords=profile.keywords,
        organization=profile.organization,
        biography=profile.biography
    )
    db.add(new_profile)
    db.commit()
    return {"message": "Research profile created successfully"}

@router.post("/publication")
def create_publication(
    pub: PublicationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user["email"]).first()
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Create a research profile first")
        
    new_pub = Publication(
        profile_id=profile.id,
        title=pub.title,
        authors=pub.authors,
        year=pub.year,
        source=pub.source
    )
    db.add(new_pub)
    db.commit()
    return {"message": "Publication added successfully"}

@router.post("/patent")
def create_patent(
    pat: PatentCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user["email"]).first()
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Create a research profile first")
        
    new_pat = Patent(
        profile_id=profile.id,
        title=pat.title,
        patent_number=pat.patent_number,
        filing_year=pat.filing_year,
        status=pat.status
    )
    db.add(new_pat)
    db.commit()
    return {"message": "Patent added successfully"}