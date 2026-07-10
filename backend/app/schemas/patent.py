from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .institution import InstitutionResponse
from .author import AuthorResponse


class PatentBase(BaseModel):
    patent_number: str
    title: str
    date: Optional[str] = None
    abstract: Optional[str] = None
    kind: Optional[str] = None
    assignee_id: Optional[int] = None
    inventor_id: Optional[int] = None


class PatentCreate(PatentBase):
    pass


class PatentResponse(PatentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    assignee: Optional[InstitutionResponse] = None
    inventor: Optional[AuthorResponse] = None

    class Config:
        from_attributes = True
