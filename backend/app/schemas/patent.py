from datetime import date
from typing import Optional

from pydantic import BaseModel


class PatentCreate(BaseModel):
    title: str
    abstract: Optional[str] = None
    inventors: Optional[str] = None
    assignee: Optional[str] = None
    filing_date: Optional[date] = None
    publication_date: Optional[date] = None
    technology_area: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = "Pending"


class PatentUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    inventors: Optional[str] = None
    assignee: Optional[str] = None
    filing_date: Optional[date] = None
    publication_date: Optional[date] = None
    technology_area: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None


class PatentResponse(BaseModel):
    id: int
    title: str
    abstract: Optional[str]
    inventors: Optional[str]
    assignee: Optional[str]
    filing_date: Optional[date]
    publication_date: Optional[date]
    technology_area: Optional[str]
    country: Optional[str]
    status: Optional[str]

    class Config:
        from_attributes = True