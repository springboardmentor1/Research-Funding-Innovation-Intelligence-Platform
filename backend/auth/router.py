from sqlalchemy import func, or_
from fastapi import APIRouter, Depends, HTTPException, Request, status
import logging
import os
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import User, LoginHistory
from auth.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from auth.utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

logger = logging.getLogger("auth")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    clean_username = user_data.username.strip()
    clean_email = user_data.email.strip().lower()

    # Log normalized inputs and DB path for debugging environment mismatches
    logger.info("Register request: username=%s email=%s db=%s", clean_username.lower(), clean_email, os.getenv("DATABASE_URL"))

    # Check username uniqueness (case-insensitive)
    if db.query(User).filter(func.lower(User.username) == clean_username.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    # Check email uniqueness (case-insensitive)
    if db.query(User).filter(func.lower(User.email) == clean_email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        # Store username normalized to lowercase to avoid case-sensitive mismatches
        username=clean_username.lower(),
        email=clean_email,
        hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Login and receive a JWT token (supports username or email, case-insensitive)."""
    identifier = credentials.username.strip()
    logger.info("Login request: identifier=%s db=%s", identifier, os.getenv("DATABASE_URL"))
    
    # Check by case-insensitive username or email
    user = db.query(User).filter(
        or_(
            func.lower(User.username) == identifier.lower(),
            func.lower(User.email) == identifier.lower()
        )
    ).first()

    # User does not exist at all
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not registered"
        )

    # User exists but password is wrong
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username or password incorrect"
        )

    # Store login history
    login_record = LoginHistory(
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", ""),
    )
    db.add(login_record)
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/logout")
def logout():
    """Logout — client should discard the token."""
    return {"message": "Logged out successfully. Please discard your token."}

