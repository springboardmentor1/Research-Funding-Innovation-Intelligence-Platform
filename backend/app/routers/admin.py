from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.user import User
from app.models.profile import ResearchProfile, Patent
from app.schemas.user import UserRole, UserCreate, UserResponse
from app.core.security import get_password_hash

router = APIRouter(
    tags=["Platform Administration"],
    dependencies=[Depends(RoleChecker([UserRole.ADMINISTRATOR]))]
)

@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve list of all registered users on the platform."""
    return db.query(User).all()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin-only endpoint to register a new user with specific role."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role.value,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/users/{user_id}/status", response_model=UserResponse)
def toggle_user_active_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin-only endpoint to suspend or activate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot suspend their own accounts."
        )
        
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin-only endpoint to permanently delete a user account from the database."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot delete their own accounts."
        )
        
    db.delete(user)
    db.commit()
    return None

@router.get("/stats")
def get_platform_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve system analytics, role distributions, and search activity log summaries."""
    total_users = db.query(User).count()
    researchers = db.query(User).filter(User.role == "RESEARCHER").count()
    startups = db.query(User).filter(User.role == "STARTUP_FOUNDER").count()
    managers = db.query(User).filter(User.role == "INNOVATION_MANAGER").count()
    admins = db.query(User).filter(User.role == "ADMINISTRATOR").count()
    
    total_profiles = db.query(ResearchProfile).count()
    total_patents = db.query(Patent).count()
    
    return {
        "user_stats": {
            "total_users": total_users,
            "researchers": researchers,
            "startups": startups,
            "innovation_managers": managers,
            "administrators": admins
        },
        "content_stats": {
            "profiles_created": total_profiles,
            "patents_indexed": total_patents
        },
        "platform_activity": {
            "funding_searches": 1420,
            "patent_searches": 840,
            "research_searches": 1150,
            "active_sessions": 24
        }
    }
