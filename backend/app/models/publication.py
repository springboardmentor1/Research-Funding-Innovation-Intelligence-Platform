from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String(300), nullable=False)

    journal = Column(String(200))

    publication_year = Column(Integer)

    citation_count = Column(Integer, default=0)

    research_area = Column(String(200))
    
    status = Column(String(50), default="Published")

    user = relationship("User", back_populates="publications")