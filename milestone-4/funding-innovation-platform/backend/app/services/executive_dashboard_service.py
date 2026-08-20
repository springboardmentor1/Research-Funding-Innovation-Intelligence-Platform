"""
Executive Dashboard (Milestone 4, spec section 4.9 'Dashboard & Analytics' —
the Admin/executive summary view). Composes the headline KPI from every
existing module service into a single payload; introduces no new queries
beyond what ReportsRepository already provides for the reports module.
"""
from sqlalchemy.orm import Session

from app.repositories.reports_repository import ReportsRepository
from app.schemas.executive_dashboard import ExecutiveDashboardSummary
from app.services.analytics_service import AnalyticsService
from app.services.innovation_scoring_service import InnovationScoringService
from app.services.patent_analysis_service import PatentAnalysisService
from app.services.research_trend_service import ResearchTrendService
from app.services.technology_intelligence_service import TechnologyIntelligenceService


class ExecutiveDashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.reports_repo = ReportsRepository(db)

    def summary(self) -> ExecutiveDashboardSummary:
        overview = AnalyticsService(self.db).overview()
        research = ResearchTrendService(self.db)
        patents = PatentAnalysisService(self.db).trend()
        maturity = TechnologyIntelligenceService(self.db).maturity_breakdown()
        leaderboard = InnovationScoringService(self.db).leaderboard(limit=5)
        commercialization_counts = self.reports_repo.commercialization_counts_by_type()

        return ExecutiveDashboardSummary(
            total_users=overview["total_users"],
            total_opportunities=overview["total_opportunities"],
            total_applications=overview["total_applications"],
            total_bookmarks=overview["total_bookmarks"],
            publication_trend=research.publication_trend(),
            citation_analytics=research.citation_analytics(),
            patent_trend=patents,
            total_patents_tracked=sum(p.patent_count for p in patents),
            technology_maturity_counts={
                (m.maturity_level.value if hasattr(m.maturity_level, "value") else str(m.maturity_level)): m.technology_count
                for m in maturity
            },
            innovation_leaderboard_top5=leaderboard,
            commercialization_by_type=commercialization_counts,
        )
