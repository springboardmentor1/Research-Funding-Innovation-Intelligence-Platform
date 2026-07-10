from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .concept import ConceptResponse
from .author import AuthorResponse


class PublicationBase(BaseModel):
    openalex_id: str
    title: str
    doi: Optional[str] = None
    publication_year: Optional[int] = None
    journal: Optional[str] = None
    citation_count: int = 0
    concept_id: Optional[int] = None


class PublicationCreate(PublicationBase):
    pass


class PublicationResponse(PublicationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    concept: Optional[ConceptResponse] = None
    authors: List[AuthorResponse] = []

    class Config:
        from_attributes = True
