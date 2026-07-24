from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services import auth_service
from app.services.auth_service import UserCreate, UserLogin, Token, UserResponse, get_current_user, RoleChecker
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user to the platform.
    
    Roles must be one of:
    - Researcher
    - Startup Founder
    - Innovation Manager
    - Administrator
    """
    new_user = auth_service.register_user(db, user_data)
    return new_user

@router.post("/login", response_model=Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    OAuth2 standard login endpoint supporting Form Data (x-www-form-urlencoded).
    Required to support Swagger UI Authorize lock triggers.
    Note: username input field corresponds to email.
    """
    login_data = UserLogin(email=form_data.username, password=form_data.password)
    return auth_service.authenticate_user(db, login_data)

@router.post("/login-json", response_model=Token)
def login_json(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Standard JSON payload login endpoint.
    Useful for SPA API integration.
    """
    return auth_service.authenticate_user(db, login_data)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve authenticated user profile parameters using JWT Bearer token.
    """
    return current_user

# Sample role protected route to verify Administrator permissions
@router.get("/admin-only", response_model=UserResponse)
def admin_only_endpoint(current_user: User = Depends(RoleChecker(["Administrator"]))):
    """
    Endpoint protected to verify Administrator access.
    Returns 403 Forbidden for other roles.
    """
    return current_user
