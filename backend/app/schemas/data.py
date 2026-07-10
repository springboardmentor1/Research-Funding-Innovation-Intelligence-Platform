from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PublicationBase(BaseModel):
    title: str
    authors_str: str
    journal: Optional[str] = None
    abstract: Optional[str] = None
    year: Optional[int] = None
    citations: Optional[int] = 0
    doi: Optional[str] = None


class PublicationCreate(PublicationBase):
    pass


class PublicationResponse(PublicationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatentBase(BaseModel):
    title: str
    assignee: str
    application_number: Optional[str] = None
    publication_number: Optional[str] = None
    status: str
    filing_date: Optional[datetime] = None
    abstract: Optional[str] = None
    citations: Optional[int] = 0


class PatentCreate(PatentBase):
    pass


class PatentResponse(PatentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GrantOpportunityBase(BaseModel):
    title: str
    agency: str
    amount: Optional[float] = None
    deadline: Optional[datetime] = None
    stage: Optional[str] = None
    tags: Optional[str] = None
    ai_brief: Optional[str] = None
    match_score: Optional[int] = 0


class GrantOpportunityCreate(GrantOpportunityBase):
    pass


class GrantOpportunityResponse(GrantOpportunityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    publications_count: int
    patents_count: int
    grants_count: int
    citations_count: int
    grants_amount_sum: float
