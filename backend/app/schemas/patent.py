from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict

class PatentCreate(BaseModel):
    title: str
    patent_number: Optional[str] = None
    assignee: str
    filing_date: Optional[date] = None
    patent_classification: Optional[str] = None
    technology_domain: list[str] = []
    citation_count: int = 0
    abstract: Optional[str] = None
    source: str = "manual"

class PatentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    patent_number: Optional[str]
    assignee: str
    filing_date: Optional[date]
    patent_classification: Optional[str]
    technology_domain: list
    citation_count: int
    abstract: Optional[str]
    source: str

class PatentClusterEntry(BaseModel):
    technology_domain: str
    patent_count: int
    avg_citation_count: float

class PatentYearCount(BaseModel):
    year: int
    count: int

class CompetitorEntry(BaseModel):
    assignee: str
    patent_count: int
    total_citations: int
