"""Schema for the Executive Dashboard (Milestone 4) — a single composite
payload pulling the headline KPI from every module so leadership doesn't
have to visit five separate dashboards."""
from pydantic import BaseModel

from app.schemas.innovation_score import InnovationScoreLeaderboardEntry
from app.schemas.patent_analysis import PatentTrendPoint
from app.schemas.research_trend import CitationAnalyticsSummary, PublicationTrendPoint


class ExecutiveDashboardSummary(BaseModel):
    # Platform / funding
    total_users: int
    total_opportunities: int
    total_applications: int
    total_bookmarks: int

    # Research
    publication_trend: list[PublicationTrendPoint]
    citation_analytics: CitationAnalyticsSummary

    # Patents
    patent_trend: list[PatentTrendPoint]
    total_patents_tracked: int

    # Technology
    technology_maturity_counts: dict[str, int]

    # Innovation & commercialization
    innovation_leaderboard_top5: list[InnovationScoreLeaderboardEntry]
    commercialization_by_type: dict[str, int]
