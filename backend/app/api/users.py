from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Administrator role required.")
    return db.query(User).all()
