from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.user import User
from models.profile import ResearchProfile
from schemas.user_schema import RegisterRequest, LoginRequest
from utils.security import get_password_hash, verify_password
from auth.auth import create_access_token

def register_user(db: Session, req: RegisterRequest):
    # Check if user already exists
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    # Hash password and create user record
    hashed_pwd = get_password_hash(req.password)
    user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=hashed_pwd,
        role=req.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize empty profile for user
    profile = ResearchProfile(
        user_id=user.id,
        bio="",
        organization="",
        department="",
        research_domains=[],
        keywords=[],
        linked_publications=[],
        linked_patents=[]
    )
    db.add(profile)
    db.commit()

    # Generate access token
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }


def authenticate_user(db: Session, req: LoginRequest):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }
