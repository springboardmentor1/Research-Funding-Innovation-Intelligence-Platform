"""Business logic for reading and managing notifications."""
import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.notification import Notification
from app.models.user import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.common import PaginatedResponse

logger = logging.getLogger("app.services.notification")


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = NotificationRepository(db)

    def list_mine(self, user: User, unread_only: bool, page: int, page_size: int) -> PaginatedResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.list_by_user(user.id, unread_only=unread_only, skip=skip, limit=page_size)
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)

    def count_unread(self, user: User) -> int:
        return self.repo.count_unread(user.id)

    def mark_read(self, user: User, notification_id: uuid.UUID) -> Notification:
        notification = self.repo.get_by_id(notification_id)
        if not notification:
            raise NotFoundError("Notification not found.")
        if notification.user_id != user.id:
            raise PermissionDeniedError("You do not have access to this notification.")
        return self.repo.mark_read(notification)

    def mark_all_read(self, user: User) -> int:
        count = self.repo.mark_all_read(user.id)
        logger.info("Marked %d notifications as read for user %s", count, user.email)
        return count
