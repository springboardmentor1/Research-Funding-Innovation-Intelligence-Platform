from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ResearcherDashboardResponse(BaseModel):
    innovation_score: Optional[float] = 0.0
    funding_recommendations: List[Dict[str, Any]]
    research_trends: List[Dict[str, Any]]
    publication_analytics: Dict[str, Any]
    patent_insights: Dict[str, Any]

class StartupDashboardResponse(BaseModel):
    funding_opportunities: List[Dict[str, Any]]
    technology_opportunities: List[Dict[str, Any]]
    patent_intelligence: Dict[str, Any]
    commercialization_insights: List[Dict[str, Any]]

class InnovationManagerDashboardResponse(BaseModel):
    portfolio_analytics: Dict[str, Any]
    innovation_pipeline: List[Dict[str, Any]]
    technology_trend_monitoring: List[Dict[str, Any]]
    funding_analytics: Dict[str, Any]

class AdminDashboardResponse(BaseModel):
    user_management_stats: Dict[str, Any]
    platform_analytics: Dict[str, Any]
    recommendation_monitoring: Dict[str, Any]
    system_reports: List[Dict[str, Any]]
