"""
User model and role enum.

Defines the User database model and supported user roles.
"""
from sqlalchemy import Column, String, Enum
from .base import BaseModel
import enum


class UserRole(str, enum.Enum):
    """
    Enumeration of supported user roles.
    
    Values:
        RESEARCHER: Default user role for academic researchers
        STARTUP_FOUNDER: Role for startup founders
        INNOVATION_MANAGER: Role for innovation managers
        ADMINISTRATOR: Administrative role with full access
    """
    RESEARCHER = "researcher"
    STARTUP_FOUNDER = "startup_founder"
    INNOVATION_MANAGER = "innovation_manager"
    ADMINISTRATOR = "administrator"


class User(BaseModel):
    """
    User database model.
    
    Stores user account information including authentication credentials and profile details.
    """
    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.RESEARCHER, nullable=False)
    orcid = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    domain = Column(String, nullable=True)
