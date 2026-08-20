"""Pydantic schemas for application tracking."""
import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.application import ApplicationStatus
from app.schemas.funding_opportunity import FundingOpportunitySummary
from app.schemas.user import UserResponse


class ApplicationCreate(BaseModel):
    notes: str | None = Field(default=None, max_length=5000)


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    reviewer_comment: str | None = Field(default=None, max_length=5000)


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    opportunity_id: uuid.UUID
    applicant_id: uuid.UUID
    status: ApplicationStatus
    notes: str | None
    reviewer_comment: str | None
    document_url: str | None
    reviewed_by_id: uuid.UUID | None
    submitted_at: datetime
    decided_at: datetime | None
    updated_at: datetime

    opportunity: FundingOpportunitySummary | None = None
    applicant: UserResponse | None = None

    model_config = {"from_attributes": True}
