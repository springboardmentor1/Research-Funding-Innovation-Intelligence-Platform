from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    password_hash = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)

    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)

    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    role = relationship("Role")

    organization = relationship("Organization")

    patents = relationship("Patent", back_populates="user")

    profile = relationship(
        "ResearchProfile",
        back_populates="user",
        uselist=False
    )