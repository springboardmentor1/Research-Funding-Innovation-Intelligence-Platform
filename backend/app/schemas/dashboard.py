from pydantic import BaseModel

from app.schemas.publication_analytics import (
    PublicationSummary,
    YearlyPublicationTrend,
    ResearchAreaTrend,
    JournalTrend,
)


class DashboardResponse(BaseModel):
    summary: PublicationSummary

    yearly_trend: list[YearlyPublicationTrend]

    research_area_trend: list[ResearchAreaTrend]

    journal_trend: list[JournalTrend]