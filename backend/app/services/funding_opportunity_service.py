from sqlalchemy.orm import Session

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


def get_all_funding_opportunities(
    db: Session,
):
    return (
        db.query(FundingOpportunity)
        .order_by(FundingOpportunity.deadline.asc())
        .all()
    )


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