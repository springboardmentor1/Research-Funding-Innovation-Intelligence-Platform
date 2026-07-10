from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel


class Author(BaseModel):
    __tablename__ = "authors"

    orcid_id = Column(String, unique=True, index=True, nullable=True)
    openalex_id = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=False)
    primary_institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)

    # Relationships
    primary_institution = relationship("Institution", back_populates="authors")
    publications = relationship("Publication", secondary="publication_authors", back_populates="authors")
