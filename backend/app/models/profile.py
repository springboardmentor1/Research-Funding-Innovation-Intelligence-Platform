from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    organization = Column(String(255), nullable=True)
    biography = Column(Text, nullable=True)
    
    # Store domains, keywords, and tech areas as JSON lists (e.g., ["Machine Learning", "Quantum Computing"])
    research_domains = Column(JSON, default=list, nullable=False)
    keywords = Column(JSON, default=list, nullable=False)
    technology_areas = Column(JSON, default=list, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")
    publications = relationship("Publication", back_populates="profile", cascade="all, delete-orphan")
    patents = relationship("Patent", back_populates="profile", cascade="all, delete-orphan")


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("research_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    authors = Column(Text, nullable=False)  # Comma-separated list of authors
    journal_or_conference = Column(String(255), nullable=True)
    publication_year = Column(Integer, nullable=True)
    doi = Column(String(100), nullable=True)
    url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    profile = relationship("ResearchProfile", back_populates="publications")


class Patent(Base):
    __tablename__ = "patents"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("research_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    patent_number = Column(String(100), unique=True, index=True, nullable=False)
    filing_date = Column(String(50), nullable=True)  # Format: YYYY-MM-DD or standard string
    status = Column(String(50), nullable=True)  # e.g., "Pending", "Granted"
    url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    profile = relationship("ResearchProfile", back_populates="patents")
