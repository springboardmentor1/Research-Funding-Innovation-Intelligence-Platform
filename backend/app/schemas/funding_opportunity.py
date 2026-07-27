from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class FundingOpportunityBase(BaseModel):
    title: str
    agency: str
    research_area: str
    description: str
    funding_amount: float
    deadline: date
    eligibility: str
    min_experience: int = 0
    application_url: str
    status: str = "Open"


class FundingOpportunityCreate(FundingOpportunityBase):
    pass


class FundingOpportunityUpdate(BaseModel):
    title: str | None = None
    agency: str | None = None
    research_area: str | None = None
    description: str | None = None
    funding_amount: float | None = None
    deadline: date | None = None
    eligibility: str | None = None
    min_experience: int | None = None
    application_url: str | None = None
    status: str | None = None


class FundingOpportunityResponse(FundingOpportunityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class FundingPaginationResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[FundingOpportunityResponse]

class FundingAgencyAnalytics(BaseModel):
    agency: str
    count: int

    model_config = ConfigDict(from_attributes=True)

class FundingResearchAreaAnalytics(BaseModel):
    research_area: str
    count: int

class FundingStatusAnalytics(BaseModel):
    status: str
    count: int

class FundingStatistics(BaseModel):
    total_opportunities: int
    total_funding_amount: float
    average_funding_amount: float
    highest_funding: float
    lowest_funding: float

class UpcomingDeadlineResponse(BaseModel):
    title: str
    agency: str
    deadline: date
    days_remaining: int

    model_config = ConfigDict(from_attributes=True)