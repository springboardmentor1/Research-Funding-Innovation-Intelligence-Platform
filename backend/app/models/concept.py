from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.orm import relationship
from .base import BaseModel


class Concept(BaseModel):
    __tablename__ = "concepts"

    openalex_id = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    level = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    publications = relationship("Publication", back_populates="concept")
