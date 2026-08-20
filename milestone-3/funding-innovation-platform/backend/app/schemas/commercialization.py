"""Pydantic schemas for the Commercialization Recommendation module (Milestone 3)."""
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.commercialization_recommendation import RecommendationType


class CommercializationRecommendationResponse(BaseModel):
    id: uuid.UUID
    profile_id: uuid.UUID
    based_on_score_id: uuid.UUID | None
    recommendation_type: RecommendationType
    title: str
    rationale: str
    confidence_score: int
    is_dismissed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
