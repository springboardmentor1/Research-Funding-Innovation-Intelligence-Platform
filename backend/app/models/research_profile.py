from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    research_area = Column(String(255), nullable=False)

    institution = Column(String(255), nullable=False)

    designation = Column(String(255), nullable=True)

    experience_years = Column(Integer, nullable=True)

    bio = Column(Text, nullable=True)

    user = relationship(
        "User",
        back_populates="research_profile"
    )