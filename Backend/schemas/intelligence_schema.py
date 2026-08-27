from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class TechnologyTrendResponse(BaseModel):
    id: int
    topic_name: str
    growth_velocity: float
    maturity_stage: str
    patent_count: int
    publication_count: int
    last_analyzed: datetime

    class Config:
        from_attributes = True

class InnovationScoreResponse(BaseModel):
    id: int
    profile_id: int
    composite_score: float
    research_novelty_score: float
    patent_strength_score: float
    technology_maturity_score: float
    market_potential_score: float
    funding_relevance_score: float
    calculated_at: datetime

    class Config:
        from_attributes = True

class CommercializationRecommendationResponse(BaseModel):
    id: int
    profile_id: int
    productization_suggestions: List[Dict[str, Any]]
    licensing_opportunities: List[Dict[str, Any]]
    startup_creation_recommendations: List[Dict[str, Any]]
    industry_partnerships: List[Dict[str, Any]]
    generated_at: datetime

    class Config:
        from_attributes = True
