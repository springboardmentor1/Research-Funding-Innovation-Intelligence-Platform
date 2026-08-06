import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, DateTime, Date, Text, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Patent(Base):
    __tablename__ = "patents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    patent_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=True)
    assignee: Mapped[str] = mapped_column(String(255), nullable=False)
    filing_date: Mapped[date] = mapped_column(Date, nullable=True)
    patent_classification: Mapped[str] = mapped_column(String(100), nullable=True)
    technology_domain: Mapped[list] = mapped_column(JSON, default=list)
    citation_count: Mapped[int] = mapped_column(Integer, default=0)
    abstract: Mapped[str] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(100), default="manual")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
