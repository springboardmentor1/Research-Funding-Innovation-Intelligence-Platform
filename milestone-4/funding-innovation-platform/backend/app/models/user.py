"""
User ORM model.

Roles implement the platform's Role-Based Access Control (RBAC) system:
Researcher, Startup Founder, Innovation Manager, and Administrator.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    RESEARCHER = "researcher"
    STARTUP_FOUNDER = "startup_founder"
    INNOVATION_MANAGER = "innovation_manager"
    ADMINISTRATOR = "administrator"


class OAuthProvider(str, enum.Enum):
    LOCAL = "local"
    GOOGLE = "google"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)

    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            create_type=False,
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=UserRole.RESEARCHER,
        nullable=False,
    )

    oauth_provider: Mapped[OAuthProvider] = mapped_column(
        Enum(
            OAuthProvider,
            name="oauth_provider",
            create_type=False,
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=OAuthProvider.LOCAL,
        nullable=False,
    )
    oauth_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    research_profile: Mapped["ResearchProfile"] = relationship(
        "ResearchProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id} email={self.email} role={self.role}>"
