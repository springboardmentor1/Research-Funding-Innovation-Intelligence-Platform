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

    title = Column(String, nullable=False)
    authors_str = Column(String, nullable=False)
    journal = Column(String, nullable=True)
    abstract = Column(Text, nullable=True)
    year = Column(Integer, nullable=True)
    citations = Column(Integer, default=0)
    doi = Column(String, nullable=True, unique=True)
    concept_id = Column(Integer, ForeignKey('concepts.id'), nullable=True)

    # Relationships
    concept = relationship("Concept", back_populates="publications")
    authors = relationship("Author", secondary=publication_authors, back_populates="publications")
