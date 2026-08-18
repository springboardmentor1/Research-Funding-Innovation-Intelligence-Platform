from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from datetime import datetime
from app.database.base import Base

class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    funding_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False, index=True)
    organization = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    research_area = Column(String(255), nullable=False, index=True)
    funding_amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), default="USD")
    deadline = Column(String(50), nullable=True) # ISO Date format YYYY-MM-DD
    eligibility = Column(Text, nullable=True)
    country = Column(String(100), default="Global")
    application_url = Column(String(500), nullable=True)
    source = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
