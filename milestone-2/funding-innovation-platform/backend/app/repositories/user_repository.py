"""
Data-access layer for the User entity. Repositories isolate SQLAlchemy
query logic from business logic (services), following Clean Architecture.
"""
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email.lower())
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        return self.db.execute(stmt).scalar_one_or_none()

    def has_any_admin(self) -> bool:
        stmt = (
            select(User)
            .where(User.role == UserRole.ADMINISTRATOR)
            .limit(1)
        )
        return self.db.execute(stmt).scalar_one_or_none() is not None

    def get_by_oauth(self, provider: str, oauth_id: str) -> User | None:
        stmt = select(User).where(User.oauth_provider == provider, User.oauth_id == oauth_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def list_all(self, skip: int = 0, limit: int = 100) -> tuple[list[User], int]:
        total = self.db.execute(select(User)).scalars().all()
        stmt = select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
        items = self.db.execute(stmt).scalars().all()
        return list(items), len(total)

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()
