from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class FundingOpportunityBase(BaseModel):
    title: str
    source: str
    description: str
    eligibility_criteria: Optional[str] = ""
    domain_tags: List[str] = []
    deadline: Optional[str] = None
    amount: Optional[str] = None
    min_career_stage: Optional[str] = None
    institution_type: Optional[str] = None
    region: Optional[str] = None
    min_amount: Optional[int] = None
    max_amount: Optional[int] = None
    deadline_date: Optional[datetime] = None


class FundingOpportunityCreate(FundingOpportunityBase):
    pass


class FundingOpportunityResponse(FundingOpportunityBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FundingMatchResponse(FundingOpportunityResponse):
    match_score: float
    eligibility_passes: dict = {}


class GrantTrackingBase(BaseModel):
    status: str
    notes: Optional[str] = None


class GrantTrackingCreate(GrantTrackingBase):
    pass


class GrantTrackingUpdate(GrantTrackingBase):
    status: Optional[str] = None


class GrantTrackingResponse(GrantTrackingBase):
    id: int
    user_id: int
    funding_opportunity_id: int
    updated_at: datetime
    funding_opportunity: Optional[FundingOpportunityResponse] = None

    class Config:
        from_attributes = True
