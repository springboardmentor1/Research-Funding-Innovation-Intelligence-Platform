from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PatentBase(BaseModel):
    title: str
    patent_number: str
    inventors: str
    assignee: str
    technology_area: str
    filing_date: date
    publication_date: Optional[date] = None
    status: str
    country: str
    abstract: Optional[str] = None


class PatentCreate(PatentBase):
    pass


class PatentUpdate(BaseModel):
    title: Optional[str] = None
    patent_number: Optional[str] = None
    inventors: Optional[str] = None
    assignee: Optional[str] = None
    technology_area: Optional[str] = None
    filing_date: Optional[date] = None
    publication_date: Optional[date] = None
    status: Optional[str] = None
    country: Optional[str] = None
    abstract: Optional[str] = None


class PatentResponse(PatentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)