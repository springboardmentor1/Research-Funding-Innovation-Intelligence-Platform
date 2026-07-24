from sqlalchemy import Column, Integer, String, Text, Float, DateTime, func
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    team_leader = Column(String(255), nullable=False)
    funding_received = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="Active", nullable=False)  # 'Active', 'Suspended', 'Completed'
    pipeline_stage = Column(String(50), default="IDEA", nullable=False)  # 'IDEA', 'RESEARCH', 'PROTOTYPE', 'VALIDATION', 'COMMERCIALIZATION'
    innovation_score = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
