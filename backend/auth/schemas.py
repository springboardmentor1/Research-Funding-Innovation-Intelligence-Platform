from pydantic import BaseModel, EmailStr
from database.models import RoleEnum


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.RESEARCHER


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: RoleEnum

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class GoogleAuthRequest(BaseModel):
    token: str
