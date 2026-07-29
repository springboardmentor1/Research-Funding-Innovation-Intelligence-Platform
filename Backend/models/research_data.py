from sqlalchemy import Column, Integer, String, Text, JSON
from database.db import Base

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    openalex_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(500), index=True, nullable=False)
    authors = Column(Text, nullable=False)  # Semicolon joined author names
    domain = Column(String(255), nullable=True)  # Primary topic or concept
    year = Column(Integer, nullable=False)
    keywords = Column(JSON, nullable=True)
    cited_by_count = Column(Integer, default=0, nullable=False)


class Grant(Base):
    __tablename__ = "grants"

    id = Column(Integer, primary_key=True, index=True)
    openalex_award_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(500), index=True, nullable=False)
    funder_name = Column(String(255), nullable=False)
    award_amount = Column(String(100), nullable=True)  # Grant value string, can be null
    linked_works_count = Column(Integer, default=0, nullable=False)


class Patent(Base):
    __tablename__ = "patents"

    id = Column(Integer, primary_key=True, index=True)
    patent_number = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(500), index=True, nullable=False)
    assignee = Column(String(255), index=True, default="", nullable=True)
    filing_date = Column(String(50), default="", nullable=True)
    technology_domain = Column(String(255), nullable=True)  # CPC classification
