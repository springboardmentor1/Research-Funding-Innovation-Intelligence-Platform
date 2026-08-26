from typing import Optional, List
from pydantic import BaseModel

class AIRecommendation(BaseModel):
    funding_id: str
    match_score: float
    recommendation_reason: str

class FundingRecommendationResponse(BaseModel):
    funding_id: str
    title: str
    funding_agency: str
    research_domain: str
    funding_amount: float
    currency: str
    funding_type: str
    country: str
    application_deadline: Optional[str] = None
    duration: Optional[str] = None
    eligibility: Optional[str] = None
    match_score: float
    recommendation_reason: str
    source_url: Optional[str] = None
    verified: bool
