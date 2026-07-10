from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    research_domain = Column(String(200))

    keywords = Column(String(500))

    technology_area = Column(String(200))

    biography = Column(String(1000))

    experience_years = Column(Integer)

    publication_count = Column(Integer, default=0)

    patent_count = Column(Integer, default=0)

    user = relationship("User", back_populates="profile")