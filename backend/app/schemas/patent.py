from pydantic import BaseModel
from typing import Optional

class PatentSchema(BaseModel):
    id: int
    patent_id: str
    title: str
    abstract: Optional[str] = None
    inventors: Optional[str] = None
    assignee: Optional[str] = None
    filing_date: Optional[str] = None
    publication_date: Optional[str] = None
    classification: Optional[str] = None
    technology_domain: Optional[str] = None
    citation_count: int = 0
    source: str
    url: Optional[str] = None

    class Config:
        from_attributes = True

class RelatedPatentSchema(BaseModel):
    patent: PatentSchema
    similarity_score: float
