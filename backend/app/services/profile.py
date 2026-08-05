from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.profile import ResearchProfile, Publication, Patent
from app.schemas.profile import (
    ResearchProfileCreate,
    ResearchProfileUpdate,
    PublicationCreate,
    PatentCreate
)

def get_profile_by_user_id(db: Session, user_id: int) -> ResearchProfile:
    """Retrieve a research profile from the database by user ID, auto-creating a default profile if not found."""
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        profile = ResearchProfile(
            user_id=user_id,
            first_name="Innovator",
            last_name="Member",
            organization="MIT",
            department="Computer Science Department",
            biography="Active investigator researching distributed architectures, neural systems, and machine learning optimizations.",
            research_interests=["Machine Learning", "Neural Networks", "NLP"],
            research_domains=["Artificial Intelligence", "Quantum Computing"],
            keywords=["Machine Learning", "Neural Networks", "NLP"],
            technology_areas=["Quantum Computing", "Healthcare"]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

def get_profile_by_id(db: Session, profile_id: int) -> ResearchProfile | None:
    """Retrieve a research profile from the database by profile ID."""
    return db.query(ResearchProfile).filter(ResearchProfile.id == profile_id).first()

def create_research_profile(db: Session, user_id: int, profile_in: ResearchProfileCreate) -> ResearchProfile:
    """Create a new research profile for a user, updating the existing one if it already exists."""
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if profile:
        # Update existing profile
        update_data = profile_in.model_dump()
        for field, value in update_data.items():
            setattr(profile, field, value)
        db.commit()
        db.refresh(profile)
        return profile
    
    new_profile = ResearchProfile(
        user_id=user_id,
        first_name=profile_in.first_name,
        last_name=profile_in.last_name,
        organization=profile_in.organization,
        department=profile_in.department,
        biography=profile_in.biography,
        research_interests=profile_in.research_interests,
        research_domains=profile_in.research_domains,
        keywords=profile_in.keywords,
        technology_areas=profile_in.technology_areas
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

def update_research_profile(db: Session, user_id: int, profile_in: ResearchProfileUpdate) -> ResearchProfile:
    """Update an existing research profile of a user. Raises 404 if profile doesn't exist."""
    profile = get_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found. Please create one first."
        )
    
    # Update provided fields
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
        
    db.commit()
    db.refresh(profile)
    return profile

def add_publication(db: Session, user_id: int, pub_in: PublicationCreate) -> Publication:
    """Add a publication to the user's research profile."""
    profile = get_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found. You must create a profile before adding publications."
        )
        
    new_pub = Publication(
        profile_id=profile.id,
        title=pub_in.title,
        authors=pub_in.authors,
        journal_or_conference=pub_in.journal_or_conference,
        publication_year=pub_in.publication_year,
        doi=pub_in.doi,
        url=pub_in.url,
        citations=pub_in.citations
    )
    db.add(new_pub)
    db.commit()
    db.refresh(new_pub)
    return new_pub


def add_patent(db: Session, user_id: int, patent_in: PatentCreate) -> Patent:
    """Add a patent to the user's research profile after ensuring patent number is unique."""
    # Check if patent number already exists globally in the database
    existing_patent = db.query(Patent).filter(Patent.patent_number == patent_in.patent_number).first()
    if existing_patent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A patent with number '{patent_in.patent_number}' already exists in the system."
        )
        
    profile = get_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found. You must create a profile before adding patents."
        )
        
    new_patent = Patent(
        profile_id=profile.id,
        title=patent_in.title,
        patent_number=patent_in.patent_number,
        filing_date=patent_in.filing_date,
        status=patent_in.status,
        url=patent_in.url,
        citations=patent_in.citations,
        tech_class=patent_in.tech_class,
        trl=patent_in.trl
    )
    db.add(new_patent)
    db.commit()
    db.refresh(new_patent)
    return new_patent
