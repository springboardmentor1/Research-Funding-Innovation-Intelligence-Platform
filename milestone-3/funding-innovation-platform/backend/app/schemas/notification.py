"""Pydantic schemas for notifications."""
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.notification import NotificationType
from app.schemas.funding_opportunity import FundingOpportunitySummary


class NotificationResponse(BaseModel):
    id: uuid.UUID
    type: NotificationType
    title: str
    message: str
    related_opportunity_id: uuid.UUID | None
    is_read: bool
    created_at: datetime
    related_opportunity: FundingOpportunitySummary | None = None

    model_config = {"from_attributes": True}


class UnreadCountResponse(BaseModel):
    unread_count: int
