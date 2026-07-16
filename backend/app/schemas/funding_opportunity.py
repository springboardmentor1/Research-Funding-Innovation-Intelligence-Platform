from datetime import date, datetime

from pydantic import BaseModel


class FundingOpportunityBase(BaseModel):
    title: str
    agency: str
    research_area: str
    description: str
    funding_amount: float
    deadline: date
    eligibility: str
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
    application_url: str | None = None
    status: str | None = None


class FundingOpportunityResponse(FundingOpportunityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }