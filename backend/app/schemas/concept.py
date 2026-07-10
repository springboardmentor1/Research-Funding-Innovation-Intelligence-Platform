from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ConceptBase(BaseModel):
    openalex_id: str
    display_name: str
    level: Optional[int] = None
    description: Optional[str] = None


class ConceptCreate(ConceptBase):
    pass


class ConceptResponse(ConceptBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
