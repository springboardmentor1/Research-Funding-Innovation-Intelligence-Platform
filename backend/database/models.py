from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String(100))
    university = Column(String(150))
    department = Column(String(100))
    research_interests = Column(Text)
    keywords = Column(Text)
    research_area = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id = Column(Integer, primary_key=True, index=True)
    openalex_id = Column(String(100), unique=True, index=True)
    title = Column(Text)
    authors = Column(Text)
    publication_year = Column(Integer)
    doi = Column(String(200))
    abstract = Column(Text)
    search_topic = Column(String(200))
    fetched_at = Column(DateTime, default=datetime.utcnow)


class FundingOpportunity(Base):
    __tablename__ = "funding"

    id = Column(Integer, primary_key=True, index=True)
    grant_name = Column(String(200))
    organization = Column(String(200))
    area = Column(String(100))
    amount = Column(String(50))


class Patent(Base):
    __tablename__ = "patents"

    id = Column(Integer, primary_key=True, index=True)
    patent_id = Column(String(50), unique=True)
    title = Column(Text)
    inventor = Column(String(200))
    technology = Column(String(100))
    year = Column(Integer)
