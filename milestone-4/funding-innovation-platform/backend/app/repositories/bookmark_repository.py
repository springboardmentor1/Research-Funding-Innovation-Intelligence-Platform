"""Data-access layer for FundingBookmark."""
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.bookmark import FundingBookmark


class BookmarkRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_and_opportunity(
        self, user_id: uuid.UUID, opportunity_id: uuid.UUID
    ) -> FundingBookmark | None:
        stmt = select(FundingBookmark).where(
            FundingBookmark.user_id == user_id, FundingBookmark.opportunity_id == opportunity_id
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def list_by_user(self, user_id: uuid.UUID, skip: int = 0, limit: int = 20) -> tuple[list[FundingBookmark], int]:
        base_stmt = select(FundingBookmark).where(FundingBookmark.user_id == user_id)

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = (
            base_stmt.options(selectinload(FundingBookmark.opportunity))
            .order_by(FundingBookmark.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def create(self, bookmark: FundingBookmark) -> FundingBookmark:
        self.db.add(bookmark)
        self.db.commit()
        self.db.refresh(bookmark)
        return bookmark

    def delete(self, bookmark: FundingBookmark) -> None:
        self.db.delete(bookmark)
        self.db.commit()
