from sqlalchemy.orm import Session

from app.models.patent import Patent
from app.schemas.patent import PatentCreate, PatentUpdate


def create_patent(
    db: Session,
    patent: PatentCreate,
    user_id: int,
):
    """
    Create a new patent.
    """

    existing_patent = (
        db.query(Patent)
        .filter(Patent.patent_number == patent.patent_number)
        .first()
    )

    if existing_patent:
        raise ValueError("Patent with this patent number already exists.")

    db_patent = Patent(
        **patent.model_dump(),
        user_id=user_id,
    )

    db.add(db_patent)
    db.commit()
    db.refresh(db_patent)

    return db_patent


def get_patents(
    db: Session,
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve all patents.
    """

    return (
        db.query(Patent)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_patent_by_id(
    db: Session,
    patent_id: int,
):
    """
    Retrieve a patent by ID.
    """

    return (
        db.query(Patent)
        .filter(Patent.id == patent_id)
        .first()
    )


def update_patent(
    db: Session,
    patent_id: int,
    patent_update: PatentUpdate,
):
    """
    Update an existing patent.
    """

    db_patent = get_patent_by_id(db, patent_id)

    if not db_patent:
        return None

    update_data = patent_update.model_dump(exclude_unset=True)

    if (
        "patent_number" in update_data
        and update_data["patent_number"] != db_patent.patent_number
    ):
        duplicate = (
            db.query(Patent)
            .filter(Patent.patent_number == update_data["patent_number"])
            .first()
        )

        if duplicate:
            raise ValueError(
                "Patent with this patent number already exists."
            )

    for field, value in update_data.items():
        setattr(db_patent, field, value)

    db.commit()
    db.refresh(db_patent)

    return db_patent


def delete_patent(
    db: Session,
    patent_id: int,
):
    """
    Delete a patent.
    """

    db_patent = get_patent_by_id(db, patent_id)

    if not db_patent:
        return None

    db.delete(db_patent)
    db.commit()

    return db_patent