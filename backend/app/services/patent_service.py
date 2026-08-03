from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, or_
from math import ceil
from sqlalchemy import func
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
    search: str = None,
    inventor: str = None,
    assignee: str = None,
    technology_area: str = None,
    status: str = None,
    country: str = None,
    filing_date_from=None,
    filing_date_to=None,
    sort_by: str = "filing_date",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
):
    query = db.query(Patent)

    # Keyword Search
    if search:
        query = query.filter(
            or_(
                Patent.title.ilike(f"%{search}%"),
                Patent.patent_number.ilike(f"%{search}%"),
            )
        )

    # Filters
    if inventor:
        query = query.filter(
            Patent.inventors.ilike(f"%{inventor}%")
        )

    if assignee:
        query = query.filter(
            Patent.assignee.ilike(f"%{assignee}%")
        )

    if technology_area:
        query = query.filter(
            Patent.technology_area.ilike(f"%{technology_area}%")
        )

    if status:
        query = query.filter(
            Patent.status.ilike(f"%{status}%")
        )

    if country:
        query = query.filter(
            Patent.country.ilike(f"%{country}%")
        )

    if filing_date_from:
        query = query.filter(
            Patent.filing_date >= filing_date_from
        )

    if filing_date_to:
        query = query.filter(
            Patent.filing_date <= filing_date_to
        )

    # Sorting
    sort_columns = {
        "title": Patent.title,
        "filing_date": Patent.filing_date,
        "publication_date": Patent.publication_date,
        "status": Patent.status,
    }

    sort_column = sort_columns.get(sort_by, Patent.filing_date)

    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    total = query.count()

    patents = (
        query.offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": patents,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": ceil(total / page_size) if total else 1,
    }


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

def get_patent_statistics(db: Session):
    total = db.query(Patent).count()

    granted = db.query(Patent).filter(
        Patent.status.ilike("Granted")
    ).count()

    published = db.query(Patent).filter(
        Patent.status.ilike("Published")
    ).count()

    filed = db.query(Patent).filter(
        Patent.status.ilike("Filed")
    ).count()

    expired = db.query(Patent).filter(
        Patent.status.ilike("Expired")
    ).count()

    return {
        "total_patents": total,
        "granted_patents": granted,
        "published_patents": published,
        "filed_patents": filed,
        "expired_patents": expired,
    }