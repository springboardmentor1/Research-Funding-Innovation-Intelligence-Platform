"""Business logic for bookmarking funding opportunities."""
import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import AlreadyExistsError, NotFoundError
from app.models.bookmark import FundingBookmark
from app.models.user import User
from app.repositories.bookmark_repository import BookmarkRepository
from app.repositories.funding_opportunity_repository import FundingOpportunityRepository
from app.schemas.common import PaginatedResponse

logger = logging.getLogger("app.services.bookmark")


class BookmarkService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BookmarkRepository(db)
        self.opportunity_repo = FundingOpportunityRepository(db)

    def add(self, user: User, opportunity_id: uuid.UUID) -> FundingBookmark:
        if not self.opportunity_repo.get_by_id(opportunity_id):
            raise NotFoundError("Funding opportunity not found.")

        if self.repo.get_by_user_and_opportunity(user.id, opportunity_id):
            raise AlreadyExistsError("This opportunity is already bookmarked.")

        bookmark = FundingBookmark(user_id=user.id, opportunity_id=opportunity_id)
        bookmark = self.repo.create(bookmark)
        logger.info("Bookmark added: user=%s opportunity=%s", user.email, opportunity_id)
        return bookmark

    def remove(self, user: User, opportunity_id: uuid.UUID) -> None:
        bookmark = self.repo.get_by_user_and_opportunity(user.id, opportunity_id)
        if not bookmark:
            raise NotFoundError("Bookmark not found.")
        self.repo.delete(bookmark)
        logger.info("Bookmark removed: user=%s opportunity=%s", user.email, opportunity_id)

    def list_mine(self, user: User, page: int, page_size: int) -> PaginatedResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.list_by_user(user.id, skip=skip, limit=page_size)
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)
