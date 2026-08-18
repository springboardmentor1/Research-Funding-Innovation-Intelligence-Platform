from sqlalchemy import func, or_
from fastapi import APIRouter, Depends, HTTPException, Request, status
import logging
import os
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import User, LoginHistory, RoleEnum
from auth.schemas import UserRegister, UserLogin, TokenResponse, UserResponse, GoogleAuthRequest
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
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
        hashed_password=hash_password(user_data.password),
        role=user_data.role
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

    token = create_access_token(data={"sub": str(user.id), "username": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/logout")
def logout():
    """Logout — client should discard the token."""
    return {"message": "Logged out successfully. Please discard your token."}


@router.post("/google", response_model=TokenResponse)
def google_auth(auth_request: GoogleAuthRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate via Google OAuth."""
    try:
        # We don't enforce audience here so it works with any client ID for dev purposes,
        # but in production you should pass `audience=GOOGLE_CLIENT_ID`
        idinfo = id_token.verify_oauth2_token(auth_request.token, google_requests.Request())
        
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid Google token (no email)")
            
        # Check if user exists
        user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
        
        if not user:
            # Create user automatically
            username = idinfo.get("name", email.split("@")[0]).replace(" ", "").lower()
            # Ensure uniqueness
            base_username = username
            counter = 1
            while db.query(User).filter(func.lower(User.username) == username).first():
                username = f"{base_username}{counter}"
                counter += 1
                
            user = User(
                username=username,
                email=email.lower(),
                hashed_password=hash_password("google_oauth_placeholder_password"),
                role=RoleEnum.RESEARCHER
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Store login history
        login_record = LoginHistory(
            user_id=user.id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", ""),
        )
        db.add(login_record)
        db.commit()

        token = create_access_token(data={"sub": str(user.id), "username": user.username, "role": user.role})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(status_code=401, detail=f"Google authentication failed: {str(e)}")

