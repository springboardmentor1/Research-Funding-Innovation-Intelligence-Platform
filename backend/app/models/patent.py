from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Patent(Base):
    __tablename__ = "patents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    abstract = Column(Text, nullable=True)
    inventors = Column(String, nullable=True)
    assignee = Column(String, nullable=True)

    filing_date = Column(Date, nullable=True)
    publication_date = Column(Date, nullable=True)

    technology_area = Column(String, nullable=True)
    country = Column(String, nullable=True)
    status = Column(String, default="Pending")

    user = relationship("User", back_populates="patents")