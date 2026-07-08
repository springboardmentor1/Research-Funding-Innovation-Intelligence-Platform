from pydantic import BaseModel, HttpUrl, Field
from typing import Optional
from datetime import datetime

class ProfileCreate(BaseModel):
    research_domain: Optional[str] = Field(None, max_length=255)
    research_subdomain: Optional[str] = Field(None, max_length=255)
    keywords: Optional[str] = Field(None, max_length=500, description="Comma-separated keywords")
    organization: Optional[str] = Field(None, max_length=255)
    designation: Optional[str] = Field(None, max_length=255)
    highest_qualification: Optional[str] = Field(None, max_length=255)
    years_of_experience: Optional[int] = Field(0, ge=0)
    research_interests: Optional[str] = Field(None, max_length=1000)
    technology_areas: Optional[str] = Field(None, max_length=1000)
    publications_count: Optional[int] = Field(0, ge=0)
    patents_count: Optional[int] = Field(0, ge=0)
    biography: Optional[str] = Field(None, max_length=2000)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    orcid_id: Optional[str] = Field(None, max_length=50)

    class Config:
        json_schema_extra = {
            "example": {
                "research_domain": "Computer Science",
                "research_subdomain": "Artificial Intelligence",
                "keywords": "deep learning, computer vision, robotics",
                "organization": "MIT",
                "designation": "Researcher",
                "highest_qualification": "PhD in Computer Science",
                "years_of_experience": 5,
                "research_interests": "Autonomous systems, neural nets",
                "technology_areas": "AI, ML, Robotics",
                "publications_count": 12,
                "patents_count": 2,
                "biography": "Focused on computer vision research at MIT.",
                "linkedin_url": "https://linkedin.com/in/janedoe",
                "orcid_id": "0000-0002-1825-0097"
            }
        }

class ProfileUpdate(BaseModel):
    research_domain: Optional[str] = Field(None, max_length=255)
    research_subdomain: Optional[str] = Field(None, max_length=255)
    keywords: Optional[str] = Field(None, max_length=500)
    organization: Optional[str] = Field(None, max_length=255)
    designation: Optional[str] = Field(None, max_length=255)
    highest_qualification: Optional[str] = Field(None, max_length=255)
    years_of_experience: Optional[int] = Field(None, ge=0)
    research_interests: Optional[str] = Field(None, max_length=1000)
    technology_areas: Optional[str] = Field(None, max_length=1000)
    publications_count: Optional[int] = Field(None, ge=0)
    patents_count: Optional[int] = Field(None, ge=0)
    biography: Optional[str] = Field(None, max_length=2000)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    orcid_id: Optional[str] = Field(None, max_length=50)

class ProfileResponse(BaseModel):
    profile_id: str
    user_id: str
    research_domain: Optional[str]
    research_subdomain: Optional[str]
    keywords: Optional[str]
    organization: Optional[str]
    designation: Optional[str]
    highest_qualification: Optional[str]
    years_of_experience: Optional[int]
    research_interests: Optional[str]
    technology_areas: Optional[str]
    publications_count: Optional[int]
    patents_count: Optional[int]
    biography: Optional[str]
    linkedin_url: Optional[str]
    orcid_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
