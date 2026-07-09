from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest
from app.core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str) -> User | None:
    """Retrieve a user record from the database by email address."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Retrieve a user record from the database by user ID."""
    return db.query(User).filter(User.id == user_id).first()

def register_user(db: Session, user_in: UserCreate) -> User:
    """Register a new user after verifying that the email address is unique."""
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role.value,  # extract string value from Enum
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, login_in: LoginRequest) -> User | None:
    """Verify user credentials. Returns the User model if valid, else None."""
    user = get_user_by_email(db, login_in.email)
    if not user:
        return None
    if not verify_password(login_in.password, user.hashed_password):
        return None
    return user
