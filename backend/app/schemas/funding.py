from pydantic import BaseModel
from typing import Optional, List

class FundingSchema(BaseModel):
    id: int
    funding_id: str
    title: str
    organization: str
    description: str
    research_area: str
    funding_amount: float
    currency: str
    deadline: Optional[str] = None
    eligibility: Optional[str] = None
    country: str
    application_url: Optional[str] = None
    source: Optional[str] = None

    class Config:
        from_attributes = True

class RecommendedFundingSchema(BaseModel):
    funding: FundingSchema
    relevance_score: float # 0 - 100 %
    match_reason: str
    match_keywords: List[str]
