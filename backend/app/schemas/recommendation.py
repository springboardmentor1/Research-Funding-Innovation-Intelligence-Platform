from pydantic import BaseModel

from app.schemas.funding_opportunity import FundingOpportunityResponse


class RecommendationResponse(BaseModel):
    funding: FundingOpportunityResponse
    score: int
    match_percentage: str
    match_level: str
    reasons: list[str]
    suggestions: list[str]

class RecommendationSummary(BaseModel):
    total_recommendations: int
    high_match: int
    medium_match: int
    low_match: int