from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Researcher") # Researcher, Startup Founder, Innovation Manager, Administrator
    organization = Column(String(255), nullable=True)
    research_domain = Column(String(255), nullable=True)
    keywords = Column(Text, nullable=True) # Comma separated
    research_interests = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
