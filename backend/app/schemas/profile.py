from typing import Optional
from pydantic import BaseModel, ConfigDict

class ResearchProfileUpdate(BaseModel):
    research_domains: Optional[list[str]] = None
    keywords: Optional[list[str]] = None
    publications: Optional[list[dict]] = None
    patents: Optional[list[dict]] = None
    technology_areas: Optional[list[str]] = None
    organization: Optional[str] = None
    bio: Optional[str] = None

class ResearchProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    research_domains: list
    keywords: list
    publications: list
    patents: list
    technology_areas: list
    organization: Optional[str]
    bio: Optional[str]
