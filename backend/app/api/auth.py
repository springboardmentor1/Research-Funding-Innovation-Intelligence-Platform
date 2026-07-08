from app.schemas.user import (
    UserCreate,
    UserResponse
)
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.token import Token

from app.services.auth_service import (
    create_user,
    authenticate_user
)

from app.core.security import create_access_token
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import create_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db, user)

    if db_user is None:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return db_user
@router.post(
    "/login",
    response_model=Token
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        db,
        form_data.username,
        form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": user.email,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }