from sqlalchemy import Column, String, Enum
from .base import BaseModel
import enum


class UserRole(str, enum.Enum):
    RESEARCHER = "researcher"
    STARTUP_FOUNDER = "startup_founder"
    INNOVATION_MANAGER = "innovation_manager"
    ADMINISTRATOR = "administrator"


class User(BaseModel):
    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.RESEARCHER, nullable=False)
    orcid = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    domain = Column(String, nullable=True)
