from pydantic import BaseModel
from typing import Optional, List, Dict

class IdeaEvaluationRequest(BaseModel):
    idea_title: str
    idea_description: str
    research_domain: str
    target_market: Optional[str] = "Global"

class ScoreBreakdown(BaseModel):
    novelty: float # 30%
    patent_strength: float # 20%
    tech_maturity: float # 15%
    market_potential: float # 20%
    funding_relevance: float # 15%

class IdeaEvaluationResponse(BaseModel):
    idea_title: str
    overall_score: float
    breakdown: ScoreBreakdown
    explanation: str
    key_strengths: List[str]
    risk_factors: List[str]
    commercialization_pathways: List[str]
    suggested_funding_sources: List[str]
    related_patents_count: int
