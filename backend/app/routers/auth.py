from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User

from app.schemas.user import UserRegister

from app.auth.hashing import hash_password

from app.schemas.user import UserLogin
from app.auth.hashing import verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.oauth2 import get_current_user

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    request: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == request.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    try:
        new_user = User(
            full_name=request.full_name,
            email=request.email,
            password_hash=hash_password(request.password),
            role_id=request.role_id,
            organization_id=request.organization_id
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User registered successfully",
            "user": new_user
        }
    except Exception as e:
        db.rollback()
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login")
def login(
    request: UserLogin,
    db: Session = Depends(get_db)
):
    print(f"Login attempt for email: {request.email}")
    
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        print(f"User not found: {request.email}")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    print(f"User found: {user.email}, attempting password verification")
    
    if not verify_password(
        request.password,
        user.password_hash
    ):
        print(f"Password verification failed for: {request.email}")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    print(f"Password verification successful for: {request.email}")
    
    try:
        token = create_access_token(
            {
                "sub": str(user.id),
                "role": user.role.role_name
            }
        )
        
        print(f"Token created successfully for: {request.email}")
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role.role_name
            }
        }
    except Exception as e:
        print(f"Error creating token: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error creating authentication token"
        )

@router.post("/token")
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    if not verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role.role_name
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.role_name,
        "organization": current_user.organization.organization_name
    }