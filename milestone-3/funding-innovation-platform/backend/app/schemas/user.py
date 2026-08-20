"""
Pydantic schemas for the User resource: registration input, public
output representation, and profile-update input.
"""
import re
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import OAuthProvider, UserRole

PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$")


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    full_name: str = Field(min_length=2, max_length=255)


class UserRegister(UserBase):
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.RESEARCHER

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not PASSWORD_REGEX.match(value):
            raise ValueError(
                "Password must be at least 8 characters and include an uppercase letter, "
                "a lowercase letter, a digit, and a special character."
            )
        return value

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_.-]+$", value):
            raise ValueError("Username may only contain letters, numbers, dots, hyphens and underscores.")
        return value


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    username: str | None = Field(default=None, min_length=3, max_length=100)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not PASSWORD_REGEX.match(value):
            raise ValueError(
                "Password must be at least 8 characters and include an uppercase letter, "
                "a lowercase letter, a digit, and a special character."
            )
        return value


class UserResponse(UserBase):
    id: uuid.UUID
    role: UserRole
    oauth_provider: OAuthProvider
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    total: int
    items: list[UserResponse]
