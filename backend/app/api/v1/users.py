"""
User API endpoints.

Provides endpoints for user registration, login, profile management, and admin user listing.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...db.session import get_db
from ...schemas.user import UserCreate, UserResponse, LoginRequest, Token, UserUpdate
from ...crud.user import create_user, get_user_by_email, get_users
from ...core.security import verify_password, create_access_token, hash_password
from ...dependencies import get_current_user, require_roles
from ...models.user import User, UserRole

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    Args:
        user: User registration data
        db: Database session
        
    Returns:
        Created user data
        
    Raises:
        HTTPException: If email is already registered
    """
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return create_user(db=db, user=user)


@router.post("/login", response_model=Token)
def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user and return an access token.
    
    Args:
        login_data: Login credentials (email and password)
        db: Database session
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    db_user = get_user_by_email(db, email=login_data.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    if not verify_password(login_data.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    access_token = create_access_token(data={"sub": db_user.email, "user_id": db_user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Retrieve the current authenticated user's profile.
    
    Args:
        current_user: Current authenticated user (from dependency)
        
    Returns:
        User profile data
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_info(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the current authenticated user's profile.
    
    Args:
        user_update: User update data
        db: Database session
        current_user: Current authenticated user (from dependency)
        
    Returns:
        Updated user profile data
        
    Raises:
        HTTPException: If new email is already registered
    """
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.email is not None:
        if user_update.email != current_user.email:
            existing_user = get_user_by_email(db, email=user_update.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            current_user.email = user_update.email
    if user_update.password is not None:
        current_user.password = hash_password(user_update.password)
    if user_update.role is not None:
        current_user.role = user_update.role
    if user_update.orcid is not None:
        current_user.orcid = user_update.orcid
    if user_update.organization is not None:
        current_user.organization = user_update.organization
    if user_update.domain is not None:
        current_user.domain = user_update.domain

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/admin", response_model=List[UserResponse])
def get_all_users_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMINISTRATOR]))
):
    """
    Retrieve all users (admin only).
    
    Args:
        db: Database session
        current_user: Current authenticated user (must be administrator)
        
    Returns:
        List of all users
    """
    return get_users(db=db)
