"""Data-access layer for CommercializationRecommendation."""
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.commercialization_recommendation import CommercializationRecommendation


class CommercializationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, recommendation_id: uuid.UUID) -> CommercializationRecommendation | None:
        return self.db.get(CommercializationRecommendation, recommendation_id)

    def list_by_profile(
        self, profile_id: uuid.UUID, include_dismissed: bool = False, skip: int = 0, limit: int = 20
    ) -> tuple[list[CommercializationRecommendation], int]:
        base_stmt = select(CommercializationRecommendation).where(
            CommercializationRecommendation.profile_id == profile_id
        )
        if not include_dismissed:
            base_stmt = base_stmt.where(CommercializationRecommendation.is_dismissed.is_(False))

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = base_stmt.order_by(CommercializationRecommendation.created_at.desc()).offset(skip).limit(limit)
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def bulk_create(self, recommendations: list[CommercializationRecommendation]) -> list[CommercializationRecommendation]:
        if not recommendations:
            return []
        self.db.add_all(recommendations)
        self.db.commit()
        for r in recommendations:
            self.db.refresh(r)
        return recommendations

    def dismiss(self, recommendation: CommercializationRecommendation) -> CommercializationRecommendation:
        recommendation.is_dismissed = True
        self.db.add(recommendation)
        self.db.commit()
        self.db.refresh(recommendation)
        return recommendation
