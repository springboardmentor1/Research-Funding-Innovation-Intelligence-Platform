"""
Small, report-specific cross-cutting queries that don't belong in any
single module's repository (they read across modules purely to feed the
Reports & Export System — Milestone 4, spec section 11). Kept separate so
existing repositories (funding_opportunity, commercialization, etc.) stay
scoped to their own module.
"""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.commercialization_recommendation import CommercializationRecommendation
from app.models.funding_opportunity import FundingOpportunity


class ReportsRepository:
    def __init__(self, db: Session):
        self.db = db

    def top_funding_opportunities(self, limit: int = 15) -> list[FundingOpportunity]:
        stmt = select(FundingOpportunity).order_by(FundingOpportunity.view_count.desc()).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def commercialization_counts_by_type(self) -> dict[str, int]:
        rows = self.db.execute(
            select(CommercializationRecommendation.recommendation_type, func.count())
            .where(CommercializationRecommendation.is_dismissed.is_(False))
            .group_by(CommercializationRecommendation.recommendation_type)
        ).all()
        return {rtype.value if hasattr(rtype, "value") else rtype: count for rtype, count in rows}

    def recent_commercialization_recommendations(self, limit: int = 20) -> list[CommercializationRecommendation]:
        stmt = (
            select(CommercializationRecommendation)
            .where(CommercializationRecommendation.is_dismissed.is_(False))
            .order_by(CommercializationRecommendation.created_at.desc())
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())
