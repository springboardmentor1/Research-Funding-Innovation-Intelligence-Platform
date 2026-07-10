from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InstitutionBase(BaseModel):
    ror_id: Optional[str] = None
    openalex_id: Optional[str] = None
    name: str
    country_code: Optional[str] = None
    type: Optional[str] = None
    homepage_url: Optional[str] = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionResponse(InstitutionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
