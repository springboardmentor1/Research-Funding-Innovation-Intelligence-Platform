from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Date,
    DateTime,
)

from sqlalchemy.sql import func

from app.core.database import Base


class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    min_experience = Column(Integer, default=0)
    title = Column(String(255), nullable=False)

    agency = Column(String(255), nullable=False)

    research_area = Column(String(255), nullable=False)

    description = Column(Text, nullable=False)

    funding_amount = Column(Float, nullable=False)

    deadline = Column(Date, nullable=False)

    eligibility = Column(Text, nullable=False)

    min_experience = Column(Integer, default=0)
    
    application_url = Column(String(500), nullable=False)

    status = Column(
        String(50),
        default="Open",
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )