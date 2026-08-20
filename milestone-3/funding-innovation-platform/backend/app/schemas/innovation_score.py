"""Pydantic schemas for the Innovation Scoring Engine (Milestone 3)."""
import uuid
from datetime import datetime

from pydantic import BaseModel


class InnovationScoreResponse(BaseModel):
    id: uuid.UUID
    profile_id: uuid.UUID
    research_novelty: float
    patent_strength: float
    technology_maturity: float
    market_potential: float
    funding_relevance: float
    overall_score: float
    computed_at: datetime

    model_config = {"from_attributes": True}


class InnovationScoreLeaderboardEntry(BaseModel):
    profile_id: uuid.UUID
    organization: str | None
    researcher_full_name: str
    overall_score: float
    computed_at: datetime
