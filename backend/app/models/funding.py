from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base

class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    funding_id = Column(String(120), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=True)
    funding_agency = Column(String(255), nullable=True)
    research_domain = Column(String(255), nullable=True)
    funding_amount = Column(Float, nullable=True, default=0.0)
    currency = Column(String(10), nullable=True, default="USD")
    funding_type = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="Global")
    deadline = Column(String(50), nullable=True) # for backwards compatibility
    duration = Column(String(100), nullable=True)
    eligibility = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    keywords = Column(Text, nullable=True)
    status = Column(String(50), nullable=True, default="OPEN")
    
    # Critical fields for actual URL storage
    source_url = Column(Text, nullable=True)
    application_url = Column(Text, nullable=True) # backwards compat
    verified = Column(Boolean, nullable=False, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
