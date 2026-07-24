from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class PublicationResponse(BaseModel):
    publication_id: str
    openalex_id: str
    user_id: str
    title: str
    abstract: Optional[str]
    authors: Optional[str]
    publication_year: Optional[int]
    doi: Optional[str]
    citation_count: int
    journal: Optional[str]
    keywords: Optional[str]
    open_access: bool
    source_url: Optional[str]
    fetched_at: datetime

    class Config:
        from_attributes = True
