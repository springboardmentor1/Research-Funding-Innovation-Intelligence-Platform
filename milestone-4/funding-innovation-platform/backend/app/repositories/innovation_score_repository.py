"""Data-access layer for InnovationScore snapshots."""
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.innovation_score import InnovationScore
from app.models.research_profile import ResearchProfile
from app.models.user import User


class InnovationScoreRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_latest_for_profile(self, profile_id: uuid.UUID) -> InnovationScore | None:
        stmt = (
            select(InnovationScore)
            .where(InnovationScore.profile_id == profile_id)
            .order_by(InnovationScore.computed_at.desc())
            .limit(1)
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def list_history(
        self, profile_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> tuple[list[InnovationScore], int]:
        base_stmt = select(InnovationScore).where(InnovationScore.profile_id == profile_id)

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = base_stmt.order_by(InnovationScore.computed_at.desc()).offset(skip).limit(limit)
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def create(self, score: InnovationScore) -> InnovationScore:
        self.db.add(score)
        self.db.commit()
        self.db.refresh(score)
        return score

    def leaderboard(self, limit: int = 20) -> list[tuple[InnovationScore, ResearchProfile, User]]:
        """Returns the latest score per profile, joined with profile/user
        details, ranked by overall_score descending. The 'keep only the
        latest row per profile' step is done in Python after ordering by
        computed_at — consistent with this codebase's existing preference
        for simple Python-side aggregation over complex window-function SQL
        (see PatentAnalysisService.clusters for the same pattern)."""
        stmt = (
            select(InnovationScore, ResearchProfile, User)
            .join(ResearchProfile, ResearchProfile.id == InnovationScore.profile_id)
            .join(User, User.id == ResearchProfile.user_id)
            .order_by(InnovationScore.computed_at.desc())
        )
        rows = self.db.execute(stmt).all()

        latest_by_profile: dict[uuid.UUID, tuple[InnovationScore, ResearchProfile, User]] = {}
        for score, profile, user in rows:
            if profile.id not in latest_by_profile:
                latest_by_profile[profile.id] = (score, profile, user)

        ranked = sorted(latest_by_profile.values(), key=lambda row: row[0].overall_score, reverse=True)
        return ranked[:limit]
