from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from datetime import datetime
from app.database.base import Base

class TechnologyArea(Base):
    __tablename__ = "technology_areas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)
    growth_rate = Column(Float, default=0.0) # percentage growth e.g. +34.5%
    maturity_index = Column(Float, default=0.0) # 0 to 100
    paper_count = Column(Integer, default=0)
    patent_count = Column(Integer, default=0)
    funding_total = Column(Float, default=0.0)
    status = Column(String(50), default="Emerging") # Emerging, High Growth, Mature, Niche
    description = Column(Text, nullable=True)

class InnovationScore(Base):
    __tablename__ = "innovation_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    idea_title = Column(String(255), nullable=False)
    idea_description = Column(Text, nullable=False)
    research_domain = Column(String(255), nullable=False)
    
    # Explainable score components (0 - 100)
    novelty_score = Column(Float, nullable=False) # 30%
    patent_strength_score = Column(Float, nullable=False) # 20%
    tech_maturity_score = Column(Float, nullable=False) # 15%
    market_potential_score = Column(Float, nullable=False) # 20%
    funding_relevance_score = Column(Float, nullable=False) # 15%
    
    overall_score = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    recommendation_pathway = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="funding") # funding, patent, research, trend
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
