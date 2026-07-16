from pydantic import BaseModel

from app.schemas.funding_opportunity import FundingOpportunityResponse


class RecommendationResponse(BaseModel):
    funding: FundingOpportunityResponse
    score: int
    reasons: list[str]