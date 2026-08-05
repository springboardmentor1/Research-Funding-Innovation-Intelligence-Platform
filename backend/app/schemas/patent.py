from datetime import date, datetime
from typing import Optional
from typing import List
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

class PatentListResponse(BaseModel):
    items: List[PatentResponse]
    page: int
    page_size: int
    total: int
    total_pages: int

class PatentStatisticsResponse(BaseModel):
    total_patents: int
    granted_patents: int
    published_patents: int
    filed_patents: int
    expired_patents: int

class TechnologyAnalyticsResponse(BaseModel):
    technology_area: str
    count: int

class PatentStatusAnalyticsResponse(BaseModel):
    status: str
    count: int

class PatentCountryAnalyticsResponse(BaseModel):
    country: str
    count: int

class PatentFilingTrendResponse(BaseModel):
    year: int
    count: int

class TopInventorResponse(BaseModel):
    inventor: str
    count: int

class TopAssigneeResponse(BaseModel):
    assignee: str
    count: int

class RecentPatentResponse(BaseModel):
    id: int
    title: str
    patent_number: str
    technology_area: str
    filing_date: date
    status: str

    model_config = ConfigDict(from_attributes=True)

class EmergingTechnologyResponse(BaseModel):
    technology_area: str
    patent_count: int
    growth_score: float
    trend: str
    recommendation: str

class InnovationScoreResponse(BaseModel):
    patent_id: int
    title: str
    innovation_score: float
    innovation_level: str
    reasons: list[str]

class CommercializationResponse(BaseModel):
    patent_id: int
    title: str
    commercialization_score: float
    commercialization_level: str
    recommended_action: str
    reasons: list[str]