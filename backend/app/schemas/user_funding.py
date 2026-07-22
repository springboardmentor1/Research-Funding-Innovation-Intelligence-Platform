from pydantic import BaseModel
from datetime import datetime


class SavedFundingResponse(BaseModel):
    funding_id: int
    title: str
    agency: str
    research_area: str
    status: str

    class Config:
        from_attributes = True


class AppliedFundingResponse(BaseModel):
    funding_id: int
    title: str
    agency: str
    research_area: str
    applied_at: datetime

    class Config:
        from_attributes = True