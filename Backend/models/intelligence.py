from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime
from database.db import Base
from datetime import datetime, timezone

class TechnologyTrend(Base):
    """Tracks terms/topics for emerging technology analysis"""
    __tablename__ = "technology_trends"
    id = Column(Integer, primary_key=True, index=True)
    topic_name = Column(String(255), unique=True, index=True, nullable=False)
    growth_velocity = Column(Float, default=0.0)
    maturity_stage = Column(String(100), default="Emerging") # Emerging, Growth, Mature, Declining
    patent_count = Column(Integer, default=0)
    publication_count = Column(Integer, default=0)
    last_analyzed = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class InnovationScore(Base):
    """Stores the calculated innovation scores per research profile"""
    __tablename__ = "innovation_scores"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("research_profiles.id", ondelete="CASCADE"), nullable=False)
    
    # Computed Scores (0-100 normalized)
    composite_score = Column(Float, default=0.0) 
    research_novelty_score = Column(Float, default=0.0) # 30% weight
    patent_strength_score = Column(Float, default=0.0) # 20% weight
    technology_maturity_score = Column(Float, default=0.0) # 15% weight
    market_potential_score = Column(Float, default=0.0) # 20% weight
    funding_relevance_score = Column(Float, default=0.0) # 15% weight
    
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CommercializationRecommendation(Base):
    """Stores generated commercialization pathways from LLM analysis"""
    __tablename__ = "commercialization_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("research_profiles.id", ondelete="CASCADE"), nullable=False)
    
    # Structured outputs
    productization_suggestions = Column(JSON, default="[]")
    licensing_opportunities = Column(JSON, default="[]")
    startup_creation_recommendations = Column(JSON, default="[]")
    industry_partnerships = Column(JSON, default="[]")
    
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
