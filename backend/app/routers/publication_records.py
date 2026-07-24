from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.oauth2 import get_current_user

from app.models.publication import Publication
from app.models.user import User

from app.schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
    PublicationResponse
)

router = APIRouter(
    prefix="/publication-records",
    tags=["Publication Records"]
)

@router.post("/", response_model=PublicationResponse)
def create_publication(
    publication: PublicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_publication = Publication(
        user_id=current_user.id,
        title=publication.title,
        journal=publication.journal,
        publication_year=publication.publication_year,
        citation_count=publication.citation_count,
        research_area=publication.research_area
    )

    db.add(new_publication)
    db.commit()
    db.refresh(new_publication)

    return new_publication

@router.get("/", response_model=list[PublicationResponse])
def get_publications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    publications = (
        db.query(Publication)
        .filter(Publication.user_id == current_user.id)
        .all()
    )

    return publications

@router.put("/{publication_id}", response_model=PublicationResponse)
def update_publication(
    publication_id: int,
    publication_data: PublicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    publication = (
        db.query(Publication)
        .filter(
            Publication.id == publication_id,
            Publication.user_id == current_user.id
        )
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    update_data = publication_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(publication, key, value)

    db.commit()
    db.refresh(publication)

    return publication

@router.delete("/{publication_id}")
def delete_publication(
    publication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    publication = (
        db.query(Publication)
        .filter(
            Publication.id == publication_id,
            Publication.user_id == current_user.id
        )
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    db.delete(publication)
    db.commit()

    return {
        "message": "Publication deleted successfully"
    }