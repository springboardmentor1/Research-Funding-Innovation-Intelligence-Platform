from sqlalchemy import Column, String, Integer, DateTime, Text, Float
from sqlalchemy.sql import func
from .base import BaseModel


class GrantOpportunity(BaseModel):
    __tablename__ = "grants"

    title = Column(String, nullable=False)
    agency = Column(String, nullable=False)
    amount = Column(Float, nullable=True)
    max_amount = Column(Float, nullable=True)  # Added for frontend
    deadline = Column(DateTime(timezone=True), nullable=True)
    close_date = Column(DateTime(timezone=True), nullable=True)  # Added for frontend
    stage = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    category = Column(String, nullable=True)  # Added for frontend
    ai_brief = Column(Text, nullable=True)
    description = Column(Text, nullable=True)  # Added for frontend
    match_score = Column(Integer, default=0)
    opportunity_id = Column(String, nullable=True, unique=True)  # Added for frontend
