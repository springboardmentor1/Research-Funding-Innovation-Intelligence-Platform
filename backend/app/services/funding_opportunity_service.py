from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.models.funding_opportunity import FundingOpportunity
from app.schemas.funding_opportunity import (
    FundingOpportunityCreate,
    FundingOpportunityUpdate,
)


def create_funding_opportunity(
    db: Session,
    funding_data: FundingOpportunityCreate,
):
    funding = FundingOpportunity(
        **funding_data.model_dump()
    )

    db.add(funding)
    db.commit()
    db.refresh(funding)

    return funding


def get_funding_opportunities(
    db: Session,
    research_area: Optional[str] = None,
    agency: Optional[str] = None,
    status: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    sort: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
):
    query = db.query(FundingOpportunity)

    if research_area:
        query = query.filter(
            FundingOpportunity.research_area.ilike(f"%{research_area}%")
        )

    if agency:
        query = query.filter(
            FundingOpportunity.agency.ilike(f"%{agency}%")
        )

    if status:
        query = query.filter(
            FundingOpportunity.status.ilike(status)
        )

    if min_amount is not None:
        query = query.filter(
            FundingOpportunity.funding_amount >= min_amount
        )

    if max_amount is not None:
        query = query.filter(
            FundingOpportunity.funding_amount <= max_amount
        )

    if sort == "deadline":
        query = query.order_by(FundingOpportunity.deadline)

    elif sort == "amount":
        query = query.order_by(
            FundingOpportunity.funding_amount.desc()
        )

    offset = (page - 1) * page_size

    total = query.count()

    items = (
        query
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "items": items,
    }

def get_funding_opportunity_by_id(
    db: Session,
    funding_id: int,
):
    return (
        db.query(FundingOpportunity)
        .filter(FundingOpportunity.id == funding_id)
        .first()
    )


def update_funding_opportunity(
    db: Session,
    funding: FundingOpportunity,
    funding_data: FundingOpportunityUpdate,
):
    update_fields = funding_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_fields.items():
        setattr(funding, key, value)

    db.commit()
    db.refresh(funding)

    return funding


def delete_funding_opportunity(
    db: Session,
    funding: FundingOpportunity,
):
    db.delete(funding)
    db.commit()

def get_funding_by_agency(db: Session):
    return (
        db.query(
            FundingOpportunity.agency.label("agency"),
            func.count(FundingOpportunity.id).label("count"),
        )
        .group_by(FundingOpportunity.agency)
        .order_by(func.count(FundingOpportunity.id).desc())
        .all()
    )

def get_funding_by_research_area(db: Session):
    return (
        db.query(
            FundingOpportunity.research_area.label("research_area"),
            func.count(FundingOpportunity.id).label("count"),
        )
        .group_by(FundingOpportunity.research_area)
        .order_by(func.count(FundingOpportunity.id).desc())
        .all()
    )

def get_funding_by_status(db: Session):
    return (
        db.query(
            FundingOpportunity.status.label("status"),
            func.count(FundingOpportunity.id).label("count"),
        )
        .group_by(FundingOpportunity.status)
        .order_by(func.count(FundingOpportunity.id).desc())
        .all()
    )