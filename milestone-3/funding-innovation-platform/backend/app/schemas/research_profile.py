"""
Pydantic schemas for the Research Profile Management module: research
domains, keywords, technology areas, organization, biography, plus
nested publications and patents.
"""
import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field, HttpUrl, field_validator


class PublicationBase(BaseModel):
    title: str = Field(min_length=2, max_length=500)
    authors: str | None = Field(default=None, max_length=500)
    journal: str | None = Field(default=None, max_length=255)
    publication_date: date | None = None
    doi: str | None = Field(default=None, max_length=255)
    url: str | None = Field(default=None, max_length=500)
    citation_count: int = Field(default=0, ge=0)


class PublicationCreate(PublicationBase):
    pass


class PublicationResponse(PublicationBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class PatentBase(BaseModel):
    title: str = Field(min_length=2, max_length=500)
    patent_number: str | None = Field(default=None, max_length=100)
    assignee: str | None = Field(default=None, max_length=255)
    filing_date: date | None = None
    classification: str | None = Field(default=None, max_length=255)
    technology_domain: str | None = Field(default=None, max_length=255)
    citation_count: int = Field(default=0, ge=0)


class PatentCreate(PatentBase):
    pass


class PatentResponse(PatentBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class ResearchProfileBase(BaseModel):
    biography: str | None = Field(default=None, max_length=5000)
    organization: str | None = Field(default=None, max_length=255)
    research_domains: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    technology_areas: list[str] = Field(default_factory=list)

    @field_validator("research_domains", "keywords", "technology_areas")
    @classmethod
    def strip_and_dedupe(cls, values: list[str]) -> list[str]:
        cleaned = [v.strip() for v in values if v and v.strip()]
        # preserve order while removing duplicates
        seen: set[str] = set()
        deduped = []
        for item in cleaned:
            key = item.lower()
            if key not in seen:
                seen.add(key)
                deduped.append(item)
        return deduped


class ResearchProfileCreate(ResearchProfileBase):
    pass


class ResearchProfileUpdate(ResearchProfileBase):
    pass


class ResearchProfileResponse(ResearchProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    publications: list[PublicationResponse] = Field(default_factory=list)
    patents: list[PatentResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}
