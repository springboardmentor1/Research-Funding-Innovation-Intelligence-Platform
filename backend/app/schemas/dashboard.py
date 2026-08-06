from pydantic import BaseModel
from app.schemas.profile import ResearchProfileOut
from app.schemas.funding import FundingRecommendation
from app.schemas.research import TrendAnalysis

class ResearcherDashboard(BaseModel):
    profile: ResearchProfileOut
    funding_recommendations: list[FundingRecommendation]
    research_trends: list[TrendAnalysis]
