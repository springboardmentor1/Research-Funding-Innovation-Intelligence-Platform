from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        String(50),
        default="Researcher",
        nullable=False,
    )  # 'Researcher', 'Startup Founder', 'Innovation Manager', 'Administrator'
    is_active = Column(Boolean, default=True, nullable=False)
    notification_preferences = Column(String(500), default="{}", nullable=False) # JSON encoded string
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # One-to-one relationship with research profile
    profile = relationship("ResearchProfile", back_populates="user", uselist=False)
