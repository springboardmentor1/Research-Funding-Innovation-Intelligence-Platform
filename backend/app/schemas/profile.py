from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl

# --- Publication Schemas ---
class PublicationBase(BaseModel):
    title: str = Field(..., max_length=500, description="Title of the publication")
    authors: str = Field(..., description="Comma-separated list of authors")
    journal_or_conference: str | None = Field(None, max_length=255, description="Journal or conference name")
    publication_year: int | None = Field(None, ge=1800, le=2100, description="Year of publication")
    doi: str | None = Field(None, max_length=100, description="Digital Object Identifier (DOI)")
    url: str | None = Field(None, max_length=500, description="URL to access the publication")
    citations: int = Field(0, description="Citation count of the publication")

class PublicationCreate(PublicationBase):
    pass

class PublicationResponse(PublicationBase):
    id: int
    profile_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Patent Schemas ---
class PatentBase(BaseModel):
    title: str = Field(..., max_length=500, description="Title of the patent")
    patent_number: str = Field(..., max_length=100, description="Unique patent identifier number")
    filing_date: str | None = Field(None, max_length=50, description="Date of filing (YYYY-MM-DD)")
    status: str | None = Field(None, max_length=50, description="Status of the patent (e.g. Granted, Pending)")
    url: str | None = Field(None, max_length=500, description="URL link to the patent record")
    citations: int = Field(0, description="Citation count of the patent")
    tech_class: str | None = Field(None, max_length=100, description="Technology classification code")
    trl: int = Field(1, ge=1, le=9, description="Technology Readiness Level (1-9)")

class PatentCreate(PatentBase):
    pass

class PatentResponse(PatentBase):
    id: int
    profile_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Research Profile Schemas ---
class ResearchProfileBase(BaseModel):
    first_name: str = Field(..., max_length=100, description="First name of the researcher")
    last_name: str = Field(..., max_length=100, description="Last name of the researcher")
    organization: str | None = Field(None, max_length=255, description="Associated university or enterprise")
    department: str | None = Field(None, max_length=255, description="Associated department")
    biography: str | None = Field(None, description="Short bio description")
    research_interests: list[str] = Field(default_factory=list, description="Core research interests")
    research_domains: list[str] = Field(default_factory=list, description="Core scientific domains (e.g., AI, Nanotechnology)")
    keywords: list[str] = Field(default_factory=list, description="Keywords defining research focus")
    technology_areas: list[str] = Field(default_factory=list, description="Related technical application areas")

class ResearchProfileCreate(ResearchProfileBase):
    pass

class ResearchProfileUpdate(BaseModel):
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    organization: str | None = Field(None, max_length=255)
    department: str | None = Field(None, max_length=255)
    biography: str | None = Field(None)
    research_interests: list[str] | None = None
    research_domains: list[str] | None = None
    keywords: list[str] | None = None
    technology_areas: list[str] | None = None

class ResearchProfileResponse(ResearchProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    publications: list[PublicationResponse] = []
    patents: list[PatentResponse] = []

    class Config:
        from_attributes = True
