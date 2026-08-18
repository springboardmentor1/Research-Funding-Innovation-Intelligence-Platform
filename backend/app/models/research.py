from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from datetime import datetime
from app.database.base import Base

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False, index=True)
    abstract = Column(Text, nullable=True)
    authors = Column(String(500), nullable=True)
    publication_year = Column(Integer, nullable=False, index=True)
    doi = Column(String(255), nullable=True)
    citation_count = Column(Integer, default=0, index=True)
    concepts = Column(Text, nullable=True) # Comma separated topics
    open_access = Column(Boolean, default=False)
    publication_type = Column(String(100), nullable=True)
    source = Column(String(255), nullable=True)
    url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
