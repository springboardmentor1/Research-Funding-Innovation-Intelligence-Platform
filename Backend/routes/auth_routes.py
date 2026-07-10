from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database.db import get_db
from auth.auth import get_current_user
from models.user import User
from schemas.user_schema import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from services.auth_service import register_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user and returns a token."""
    return register_user(db, req)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates the user and returns a signed JWT access token."""
    return authenticate_user(db, req)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the profile info of the currently logged-in user."""
    return current_user
