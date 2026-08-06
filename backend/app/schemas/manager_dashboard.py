from pydantic import BaseModel
from app.schemas.funding import FundingRecommendation
from app.schemas.patent import PatentClusterEntry
from app.schemas.innovation import InnovationScore, CommercializationRecommendation

class TechnologyOpportunity(BaseModel):
    domain: str
    patent_count: int
    avg_citation_count: float
    maturity_stage: str

class StartupDashboard(BaseModel):
    funding_opportunities: list[FundingRecommendation]
    technology_opportunities: list[TechnologyOpportunity]
    patent_intelligence: list[PatentClusterEntry]
    innovation_score: InnovationScore | None
    commercialization_insights: list[CommercializationRecommendation]


class FundingAnalyticsEntry(BaseModel):
    source_category: str
    opportunity_count: int

class InnovationManagerDashboard(BaseModel):
    portfolio_patent_clusters: list[PatentClusterEntry]
    technology_pipeline: list[TechnologyOpportunity]
    funding_analytics: list[FundingAnalyticsEntry]
    total_researchers_tracked: int
    total_startups_tracked: int
