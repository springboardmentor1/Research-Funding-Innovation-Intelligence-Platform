from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class PatentResponse(BaseModel):
    patent_id: str
    external_patent_id: str
    user_id: str
    title: str
    abstract: Optional[str]
    inventors: Optional[str]
    assignee: Optional[str]
    filing_date: Optional[date]
    publication_date: Optional[date]
    status: Optional[str]
    classification: Optional[str]
    technology_domain: Optional[str]
    citation_count: int
    source_url: Optional[str]
    fetched_at: datetime

    class Config:
        from_attributes = True
