from pydantic import BaseModel
from typing import Optional, List

class PublicationSchema(BaseModel):
    id: int
    paper_id: str
    title: str
    abstract: Optional[str] = None
    authors: Optional[str] = None
    publication_year: int
    doi: Optional[str] = None
    citation_count: int = 0
    concepts: Optional[str] = None
    open_access: bool = False
    publication_type: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None

    class Config:
        from_attributes = True

class ResearchSearchQuery(BaseModel):
    query: str
    domain: Optional[str] = None
    year_start: Optional[int] = None
    year_end: Optional[int] = None
    min_citations: Optional[int] = None
