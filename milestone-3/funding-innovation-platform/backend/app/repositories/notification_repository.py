"""Data-access layer for Notification."""
import uuid

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session, selectinload

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, notification_id: uuid.UUID) -> Notification | None:
        return self.db.get(Notification, notification_id)

    def list_by_user(
        self, user_id: uuid.UUID, unread_only: bool = False, skip: int = 0, limit: int = 20
    ) -> tuple[list[Notification], int]:
        base_stmt = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            base_stmt = base_stmt.where(Notification.is_read.is_(False))

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = (
            base_stmt.options(selectinload(Notification.related_opportunity))
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def count_unread(self, user_id: uuid.UUID) -> int:
        stmt = select(func.count()).where(Notification.user_id == user_id, Notification.is_read.is_(False))
        return self.db.execute(stmt).scalar_one()

    def create(self, notification: Notification) -> Notification:
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def bulk_create(self, notifications: list[Notification]) -> None:
        """Efficiently insert many notifications at once (e.g. broadcasting a
        new-funding-match alert to every researcher whose profile overlaps)."""
        if not notifications:
            return
        self.db.add_all(notifications)
        self.db.commit()

    def mark_read(self, notification: Notification) -> Notification:
        notification.is_read = True
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def mark_all_read(self, user_id: uuid.UUID) -> int:
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount or 0
