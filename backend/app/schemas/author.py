from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .institution import InstitutionResponse


class AuthorBase(BaseModel):
    orcid_id: Optional[str] = None
    openalex_id: Optional[str] = None
    name: str
    primary_institution_id: Optional[int] = None


class AuthorCreate(AuthorBase):
    pass


class AuthorResponse(AuthorBase):
    id: int
    created_at: datetime
    updated_at: datetime
    primary_institution: Optional[InstitutionResponse] = None

    class Config:
        from_attributes = True
