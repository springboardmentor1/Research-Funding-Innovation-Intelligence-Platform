from datetime import date

from pydantic import BaseModel

from app.schemas.publication_analytics import (
    PublicationSummary,
    YearlyPublicationTrend,
    ResearchAreaTrend,
    JournalTrend,
)

from app.schemas.funding_opportunity import (
    FundingStatistics,
    FundingAgencyAnalytics,
    FundingResearchAreaAnalytics,
    FundingStatusAnalytics,
)
from app.schemas.recommendation import RecommendationSummary

from app.schemas.patent import (
    PatentStatisticsResponse,
    TechnologyAnalyticsResponse,
    PatentStatusAnalyticsResponse,
    EmergingTechnologyResponse,
    InnovationScoreResponse,
    CommercializationResponse,
)

class RecentPublication(BaseModel):
    title: str
    journal: str
    publication_date: date


class RecentFunding(BaseModel):
    title: str
    agency: str
    deadline: date


class RecentActivityResponse(BaseModel):
    recent_publications: list[RecentPublication]
    recent_funding: list[RecentFunding]

class DashboardResponse(BaseModel):
    summary: PublicationSummary
    yearly_trend: list[YearlyPublicationTrend]
    research_area_trend: list[ResearchAreaTrend]
    journal_trend: list[JournalTrend]

    funding_statistics: FundingStatistics
    recommendation_summary: RecommendationSummary
    funding_by_agency: list[FundingAgencyAnalytics]
    funding_by_research_area: list[FundingResearchAreaAnalytics]
    funding_by_status: list[FundingStatusAnalytics]

    # -------------------------
    # Patent Intelligence
    # -------------------------
    patent_statistics: PatentStatisticsResponse
    patent_technology: list[TechnologyAnalyticsResponse]
    patent_status: list[PatentStatusAnalyticsResponse]

    # -------------------------
    # Technology Intelligence
    # -------------------------
    emerging_technologies: list[EmergingTechnologyResponse]

    # -------------------------
    # Innovation Intelligence
    # -------------------------
    innovation_scores: list[InnovationScoreResponse]

    # -------------------------
    # Commercialization Intelligence
    # -------------------------
    commercialization_recommendations: list[CommercializationResponse]