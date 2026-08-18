from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "Researcher" # Researcher, Startup Founder, Innovation Manager, Administrator
    organization: Optional[str] = None
    research_domain: Optional[str] = None
    keywords: Optional[str] = None
    research_interests: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    organization: Optional[str] = None
    research_domain: Optional[str] = None
    keywords: Optional[str] = None
    research_interests: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    research_domain: Optional[str] = None
    keywords: Optional[str] = None
    research_interests: Optional[str] = None
