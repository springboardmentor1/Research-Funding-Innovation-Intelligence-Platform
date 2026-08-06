from pydantic import BaseModel

class ScoreComponent(BaseModel):
    score: float
    weight: float

class InnovationScoreBreakdown(BaseModel):
    research_novelty: ScoreComponent
    patent_strength: ScoreComponent
    technology_maturity: ScoreComponent
    market_potential: ScoreComponent
    funding_relevance: ScoreComponent

class InnovationScore(BaseModel):
    domain: str
    innovation_score: float
    breakdown: InnovationScoreBreakdown
    maturity_stage: str

class CommercializationRecommendation(BaseModel):
    category: str
    recommendation: str
    rationale: str
