"""Business logic for user profile management and administration."""
import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import AlreadyExistsError, InvalidCredentialsError, NotFoundError
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import PasswordChange, UserUpdate

logger = logging.getLogger("app.services.user")


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def get_by_id(self, user_id: uuid.UUID) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found.")
        return user

    def list_users(self, skip: int = 0, limit: int = 100) -> tuple[list[User], int]:
        return self.repo.list_all(skip=skip, limit=limit)

    def update_profile(self, user: User, payload: UserUpdate) -> User:
        if payload.username and payload.username != user.username:
            if self.repo.get_by_username(payload.username):
                raise AlreadyExistsError("This username is already taken.")
            user.username = payload.username

        if payload.full_name:
            user.full_name = payload.full_name

        updated = self.repo.update(user)
        logger.info("User profile updated: %s", updated.email)
        return updated

    def change_password(self, user: User, payload: PasswordChange) -> None:
        if not user.hashed_password or not verify_password(payload.current_password, user.hashed_password):
            raise InvalidCredentialsError("Current password is incorrect.")
        user.hashed_password = hash_password(payload.new_password)
        self.repo.update(user)
        logger.info("Password changed for user: %s", user.email)

    def deactivate_user(self, user: User) -> User:
        user.is_active = False
        return self.repo.update(user)

    def activate_user(self, user: User) -> User:
        user.is_active = True
        return self.repo.update(user)

    def change_role(self, user: User, new_role) -> User:
        user.role = new_role
        return self.repo.update(user)
