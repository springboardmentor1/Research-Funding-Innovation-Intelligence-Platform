import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, DateTime, Date, Text, JSON, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    source_category: Mapped[str] = mapped_column(String(100), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=True)
    eligible_domains: Mapped[list] = mapped_column(JSON, default=list)
    eligible_keywords: Mapped[list] = mapped_column(JSON, default=list)
    eligible_roles: Mapped[list] = mapped_column(JSON, default=list)

    min_funding_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=True)
    max_funding_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD")

    application_deadline: Mapped[date] = mapped_column(Date, nullable=True)
    application_url: Mapped[str] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
