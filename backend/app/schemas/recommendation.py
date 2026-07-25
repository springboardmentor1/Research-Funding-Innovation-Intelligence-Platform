from pydantic import BaseModel

from app.schemas.funding_opportunity import FundingOpportunityResponse


class RecommendationResponse(BaseModel):
    funding: FundingOpportunityResponse
    score: int
    match_percentage: str
    match_level: str
    reasons: list[str]
    suggestions: list[str]