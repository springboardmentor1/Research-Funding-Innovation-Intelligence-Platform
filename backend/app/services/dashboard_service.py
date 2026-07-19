from sqlalchemy.orm import Session

from app.services.publication_service import (
    get_publication_summary,
    get_yearly_publication_trend,
    get_research_area_trend,
    get_journal_trend,
)


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

    return {
        "summary": summary,
        "yearly_trend": yearly_trend,
        "research_area_trend": research_area_trend,
        "journal_trend": journal_trend,
    }