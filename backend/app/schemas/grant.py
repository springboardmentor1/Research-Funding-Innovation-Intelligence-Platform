from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GrantBase(BaseModel):
    opportunity_id: str
    title: str
    funding_agency: Optional[str] = None
    category: Optional[str] = None
    close_date: Optional[str] = None
    description: Optional[str] = None
    max_amount: Optional[float] = None
    min_amount: Optional[float] = None


class GrantCreate(GrantBase):
    pass


class GrantResponse(GrantBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
