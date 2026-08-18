"""
Notification model (Milestone 2).

Kept in PostgreSQL (rather than the MongoDB activity-log store) because
notifications are read/paginated/filtered per-user in the UI and benefit
from relational indexing and referential integrity to `users`, whereas
`activity_logs` in Mongo remains a write-heavy, schema-flexible audit trail.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class NotificationType(str, enum.Enum):
    NEW_FUNDING_MATCH = "new_funding_match"
    APPLICATION_STATUS_CHANGE = "application_status_change"
    DEADLINE_REMINDER = "deadline_reminder"
    SYSTEM = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    type: Mapped[NotificationType] = mapped_column(
        Enum(
            NotificationType,
            name="notification_type",
            create_type=False,
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    related_opportunity_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("funding_opportunities.id", ondelete="CASCADE"), nullable=True
    )

    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    user: Mapped["User"] = relationship("User")
    related_opportunity: Mapped["FundingOpportunity"] = relationship("FundingOpportunity")
