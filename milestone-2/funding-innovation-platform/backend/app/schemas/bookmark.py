"""Pydantic schemas for bookmarks."""
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.funding_opportunity import FundingOpportunitySummary


class BookmarkResponse(BaseModel):
    id: uuid.UUID
    opportunity_id: uuid.UUID
    created_at: datetime
    opportunity: FundingOpportunitySummary | None = None

    model_config = {"from_attributes": True}
