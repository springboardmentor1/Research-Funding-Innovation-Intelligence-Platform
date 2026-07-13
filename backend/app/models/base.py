"""
Base model class for all SQLAlchemy models with automatic timestamps.

Provides common fields (id, created_at, updated_at) for all models.
"""
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from ..db.session import Base


class BaseModel(Base):
    """
    Abstract base model with common fields.
    
    Fields:
        id: Primary key integer
        created_at: Timestamp of record creation (auto-set)
        updated_at: Timestamp of last update (auto-updated)
    """
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
