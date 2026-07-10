from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from .base import BaseModel


class Patent(BaseModel):
    __tablename__ = "patents"

    title = Column(String, nullable=False)
    assignee = Column(String, nullable=True)
    application_number = Column(String, nullable=True, unique=True)
    publication_number = Column(String, nullable=True, unique=True)
    status = Column(String, nullable=True)
    filing_date = Column(DateTime(timezone=True), nullable=True)
    abstract = Column(Text, nullable=True)
    citations = Column(Integer, default=0)
