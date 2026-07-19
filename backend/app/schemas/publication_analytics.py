from pydantic import BaseModel


class PublicationSummary(BaseModel):
    total_publications: int
    total_research_areas: int
    total_journals: int


class YearlyPublicationTrend(BaseModel):
    year: int
    count: int


class ResearchAreaTrend(BaseModel):
    research_area: str
    count: int


class ResearchAreaTrend(BaseModel):
    research_area: str
    count: int


class JournalTrend(BaseModel):
    journal: str
    count: int


class JournalTrend(BaseModel):
    journal: str
    count: int