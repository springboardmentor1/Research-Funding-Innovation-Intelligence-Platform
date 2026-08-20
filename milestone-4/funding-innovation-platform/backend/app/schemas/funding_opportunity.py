"""Pydantic schemas for the Funding Opportunity Management module."""
import uuid
from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.models.funding_opportunity import FundingSourceType, OpportunityStatus


def _clean_string_list(values: list[str]) -> list[str]:
    cleaned = [v.strip() for v in values if v and v.strip()]
    seen: set[str] = set()
    deduped = []
    for item in cleaned:
        key = item.lower()
        if key not in seen:
            seen.add(key)
            deduped.append(item)
    return deduped


class FundingOpportunityBase(BaseModel):
    title: str = Field(min_length=3, max_length=500)
    description: str = Field(min_length=10, max_length=10000)
    eligibility_criteria: str | None = Field(default=None, max_length=5000)

    funding_source_type: FundingSourceType
    amount_min: float | None = Field(default=None, ge=0)
    amount_max: float | None = Field(default=None, ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=10)

    research_domains: list[str] = Field(default_factory=list)
    technology_areas: list[str] = Field(default_factory=list)
    eligible_roles: list[str] = Field(default_factory=list)

    organization_name: str = Field(min_length=2, max_length=255)
    website_url: str | None = Field(default=None, max_length=500)
    contact_email: EmailStr | None = None
    application_deadline: date | None = None

    @field_validator("research_domains", "technology_areas", "eligible_roles")
    @classmethod
    def clean_lists(cls, values: list[str]) -> list[str]:
        return _clean_string_list(values)

    @model_validator(mode="after")
    def validate_amount_range(self) -> "FundingOpportunityBase":
        if self.amount_min is not None and self.amount_max is not None and self.amount_min > self.amount_max:
            raise ValueError("amount_min cannot be greater than amount_max.")
        return self


class FundingOpportunityCreate(FundingOpportunityBase):
    status: OpportunityStatus = OpportunityStatus.DRAFT


class FundingOpportunityUpdate(FundingOpportunityBase):
    status: OpportunityStatus


class FundingOpportunityResponse(FundingOpportunityBase):
    id: uuid.UUID
    status: OpportunityStatus
    attachment_url: str | None
    view_count: int
    created_by_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FundingOpportunitySummary(BaseModel):
    """Lightweight representation embedded in applications/bookmarks/notifications."""

    id: uuid.UUID
    title: str
    organization_name: str
    funding_source_type: FundingSourceType
    status: OpportunityStatus
    application_deadline: date | None

    model_config = {"from_attributes": True}


class FundingOpportunitySearchParams(BaseModel):
    q: str | None = Field(default=None, description="Free-text search across title/description/organization")
    funding_source_type: FundingSourceType | None = None
    status: OpportunityStatus | None = None
    research_domains: list[str] = Field(default_factory=list)
    technology_areas: list[str] = Field(default_factory=list)
    eligible_role: str | None = None
    min_amount: float | None = Field(default=None, ge=0)
    max_amount: float | None = Field(default=None, ge=0)
    deadline_after: date | None = None
    deadline_before: date | None = None
    sort_by: str = Field(default="created_at", pattern="^(created_at|application_deadline|amount_max|title|view_count)$")
    sort_dir: str = Field(default="desc", pattern="^(asc|desc)$")
