from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel

# Association table for many-to-many relationship between Publication and Author
publication_authors = Table(
    'publication_authors',
    BaseModel.metadata,
    Column('publication_id', Integer, ForeignKey('publications.id'), primary_key=True),
    Column('author_id', Integer, ForeignKey('authors.id'), primary_key=True)
)


class Publication(BaseModel):
    __tablename__ = "publications"

    openalex_id = Column(String, unique=True, index=True, nullable=True)
    title = Column(String, nullable=False)
    authors_str = Column(String, nullable=True)
    journal = Column(String, nullable=True)
    abstract = Column(Text, nullable=True)
    publication_year = Column(Integer, nullable=True)
    year = Column(Integer, nullable=True)  # Keep for compatibility
    citations = Column(Integer, default=0)
    citation_count = Column(Integer, default=0)  # Keep for compatibility
    doi = Column(String, nullable=True, unique=True)
    concept_id = Column(Integer, ForeignKey('concepts.id'), nullable=True)

    # Relationships
    concept = relationship("Concept", back_populates="publications")
    authors = relationship("Author", secondary=publication_authors, back_populates="publications")
