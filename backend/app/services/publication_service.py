from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, extract

from app.models.publication import Publication
from app.schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
)


def create_publication(
    db: Session,
    user_id: int,
    publication: PublicationCreate,
):
    db_publication = Publication(
        **publication.model_dump(),
        user_id=user_id,
    )

    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)

    return db_publication


def get_publications(
    db: Session,
    user_id: int,
):
    return (
        db.query(Publication)
        .filter(Publication.user_id == user_id)
        .all()
    )


def get_publication(
    db: Session,
    publication_id: int,
    user_id: int,
):
    return (
        db.query(Publication)
        .filter(
            Publication.id == publication_id,
            Publication.user_id == user_id,
        )
        .first()
    )


def update_publication(
    db: Session,
    publication: Publication,
    publication_data: PublicationUpdate,
):
    for key, value in publication_data.model_dump().items():
        setattr(publication, key, value)

    db.commit()
    db.refresh(publication)

    return publication


def delete_publication(
    db: Session,
    publication: Publication,
):
    db.delete(publication)
    db.commit()



def get_publication_summary(
    db: Session,
    user_id: int,
):
    total_publications = (
        db.query(func.count(Publication.id))
        .filter(Publication.user_id == user_id)
        .scalar()
    )

    total_research_areas = (
        db.query(
            func.count(
                distinct(Publication.research_area)
            )
        )
        .filter(Publication.user_id == user_id)
        .scalar()
    )

    total_journals = (
        db.query(
            func.count(
                distinct(Publication.journal)
            )
        )
        .filter(Publication.user_id == user_id)
        .scalar()
    )

    return {
        "total_publications": total_publications,
        "total_research_areas": total_research_areas,
        "total_journals": total_journals,
    }
def get_yearly_publication_trend(
    db: Session,
    user_id: int,
):
    results = (
        db.query(
            extract(
                "year",
                Publication.publication_date,
            ).label("year"),
            func.count(
                Publication.id
            ).label("count"),
        )
        .filter(
            Publication.user_id == user_id
        )
        .group_by(
            extract(
                "year",
                Publication.publication_date,
            )
        )
        .order_by(
            extract(
                "year",
                Publication.publication_date,
            )
        )
        .all()
    )

    return [
        {
            "year": int(row.year),
            "count": row.count,
        }
        for row in results
    ]

def get_research_area_trend(
    db: Session,
    user_id: int,
):
    results = (
        db.query(
            Publication.research_area,
            func.count(
                Publication.id
            ).label("count"),
        )
        .filter(
            Publication.user_id == user_id
        )
        .group_by(
            Publication.research_area
        )
        .order_by(
            func.count(Publication.id).desc()
        )
        .all()
    )

    return [
        {
            "research_area": row.research_area,
            "count": row.count,
        }
        for row in results
    ]

def get_journal_trend(
    db: Session,
    user_id: int,
):
    results = (
        db.query(
            Publication.journal,
            func.count(
                Publication.id
            ).label("count"),
        )
        .filter(
            Publication.user_id == user_id
        )
        .group_by(
            Publication.journal
        )
        .order_by(
            func.count(Publication.id).desc()
        )
        .all()
    )

    return [
        {
            "journal": row.journal,
            "count": row.count,
        }
        for row in results
    ]