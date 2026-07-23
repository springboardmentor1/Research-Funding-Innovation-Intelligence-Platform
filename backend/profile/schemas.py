from pydantic import BaseModel
from typing import Optional


class ProfileCreate(BaseModel):
    user_id: int
    name: str
    university: str
    department: str
    research_interests: str
    keywords: str
    research_area: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    research_interests: Optional[str] = None
    keywords: Optional[str] = None
    research_area: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    university: str
    department: str
    research_interests: str
    keywords: str
    research_area: str

    class Config:
        from_attributes = True
