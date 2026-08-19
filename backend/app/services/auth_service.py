from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
from app.models.user import User
from app.utils.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.database.connection import get_db

# ----------------------------------------------------
# Pydantic Schemas for Validation
# ----------------------------------------------------
class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(..., description="Role must be one of: Researcher, Startup Founder, Innovation Manager, Administrator")

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Jane Doe",
                "email": "jane.doe@example.com",
                "password": "securepassword123",
                "role": "Researcher"
            }
        }

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

# OAuth2 scheme config
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Valid roles checklist
VALID_ROLES = {"Researcher", "Startup Founder", "Innovation Manager", "Administrator"}

# ----------------------------------------------------
# Business Logic Service Operations
# ----------------------------------------------------
def register_user(db: Session, user_data: UserCreate) -> User:
    # 1. Check valid role
    if user_data.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed roles: {', '.join(VALID_ROLES)}"
        )
    
    # 2. Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # 3. Create user record
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, login_data: UserLogin) -> Token:
    # 1. Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Create access token
    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=str(user.id)
    )

# Dependency to fetch the current active user from JWT token
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token payload
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# ----------------------------------------------------
# Role-Based Access Control (RBAC) Dependency Factory
# ----------------------------------------------------
class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Resource forbidden. Requires one of these roles: {', '.join(self.allowed_roles)}"
            )
        return current_user
