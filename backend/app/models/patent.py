from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database.base import Base

class Patent(Base):
    __tablename__ = "patents"

    id = Column(Integer, primary_key=True, index=True)
    patent_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False, index=True)
    abstract = Column(Text, nullable=True)
    inventors = Column(String(500), nullable=True)
    assignee = Column(String(255), nullable=True, index=True)
    filing_date = Column(String(50), nullable=True)
    publication_date = Column(String(50), nullable=True)
    classification = Column(String(255), nullable=True)
    technology_domain = Column(String(255), nullable=True, index=True)
    citation_count = Column(Integer, default=0)
    source = Column(String(100), default="USPTO")
    url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
