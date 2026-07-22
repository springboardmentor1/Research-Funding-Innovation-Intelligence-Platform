from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel
from typing import List

class FundingBase(BaseModel):
    title: str
    agency: str
    description: str
    research_area: str
    keywords: str
    eligibility: Optional[str] = None
    amount: Optional[float] = None
    deadline: Optional[date] = None
    country: Optional[str] = None
    application_url: Optional[str] = None


class FundingCreate(FundingBase):
    pass


class FundingUpdate(BaseModel):
    title: Optional[str] = None
    agency: Optional[str] = None
    description: Optional[str] = None
    research_area: Optional[str] = None
    keywords: Optional[str] = None
    eligibility: Optional[str] = None
    amount: Optional[float] = None
    deadline: Optional[date] = None
    country: Optional[str] = None
    application_url: Optional[str] = None


class FundingResponse(FundingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FundingRecommendationResponse(BaseModel):
    funding_id: int
    title: str
    agency: str
    research_area: str
    match_score: int
    matched_keywords: List[str]

    class Config:
        from_attributes = True