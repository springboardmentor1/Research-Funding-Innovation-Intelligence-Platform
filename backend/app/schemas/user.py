from enum import Enum
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserRole(str, Enum):
    RESEARCHER = "RESEARCHER"
    STARTUP_FOUNDER = "STARTUP_FOUNDER"
    INNOVATION_MANAGER = "INNOVATION_MANAGER"
    ADMINISTRATOR = "ADMINISTRATOR"

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="Unique email address of the user")
    role: UserRole = Field(..., description="Role of the user in the platform")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="User password, minimum 6 characters")

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
