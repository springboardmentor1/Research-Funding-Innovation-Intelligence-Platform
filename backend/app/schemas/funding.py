from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict

class FundingOpportunityCreate(BaseModel):
    title: str
    source: str
    source_category: str
    description: Optional[str] = None
    eligible_domains: list[str] = []
    eligible_keywords: list[str] = []
    eligible_roles: list[str] = []
    min_funding_amount: Optional[float] = None
    max_funding_amount: Optional[float] = None
    currency: str = "USD"
    application_deadline: Optional[date] = None
    application_url: Optional[str] = None

class FundingOpportunityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    source: str
    source_category: str
    description: Optional[str]
    eligible_domains: list
    eligible_keywords: list
    eligible_roles: list
    min_funding_amount: Optional[float]
    max_funding_amount: Optional[float]
    currency: str
    application_deadline: Optional[date]
    application_url: Optional[str]

class FundingRecommendation(BaseModel):
    opportunity: FundingOpportunityOut
    match_score: float
    matched_domains: list[str]
    matched_keywords: list[str]
    eligible: bool
