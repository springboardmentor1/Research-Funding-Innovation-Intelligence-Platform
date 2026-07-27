from sqlalchemy.orm import Session

from app.services.publication_service import (
    get_publication_summary,
    get_yearly_publication_trend,
    get_research_area_trend,
    get_journal_trend,
)

from app.services import funding_opportunity_service
from app.services import matching_service

from app.models.publication import Publication
from app.models.funding_opportunity import FundingOpportunity


def get_dashboard(
    db: Session,
    user_id: int,
):
    summary = get_publication_summary(
        db=db,
        user_id=user_id,
    )

    yearly_trend = get_yearly_publication_trend(
        db=db,
        user_id=user_id,
    )

    research_area_trend = get_research_area_trend(
        db=db,
        user_id=user_id,
    )

    journal_trend = get_journal_trend(
        db=db,
        user_id=user_id,
    )

    funding_statistics = (
        funding_opportunity_service.get_funding_statistics(db)
    )

    funding_by_agency = (
        funding_opportunity_service.get_funding_by_agency(db)
    )

    funding_by_research_area = (
        funding_opportunity_service.get_funding_by_research_area(db)
    )

    funding_by_status = (
        funding_opportunity_service.get_funding_by_status(db)
    )

    recommendation_summary = (
        matching_service.get_recommendation_summary(
            db=db,
            user_id=user_id,
    )
)

    return {
        "summary": summary,
        "yearly_trend": yearly_trend,
        "research_area_trend": research_area_trend,
        "journal_trend": journal_trend,
        "funding_statistics": funding_statistics,
        "recommendation_summary": recommendation_summary,
        "funding_by_agency": funding_by_agency,
        "funding_by_research_area": funding_by_research_area,
        "funding_by_status": funding_by_status,
    }

def get_recent_activity(
    db: Session,
):
    recent_publications = (
        db.query(Publication)
        .order_by(Publication.publication_date.desc())
        .limit(5)
        .all()
    )

    recent_funding = (
        db.query(FundingOpportunity)
        .order_by(FundingOpportunity.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "recent_publications": recent_publications,
        "recent_funding": recent_funding,
    }