from pydantic import BaseModel, EmailStr
from app.schemas.user import UserRole

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole

class TokenData(BaseModel):
    email: str | None = None
    role: UserRole | None = None
