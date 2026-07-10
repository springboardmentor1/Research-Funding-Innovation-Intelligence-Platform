from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, UserRole
from app.core.security import hash_password


def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create default admin user
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            name="Admin User",
            email="admin@example.com",
            password=hash_password("password123"),
            role=UserRole.ADMINISTRATOR
        )
        db.add(admin_user)
        db.commit()
        print("Created default admin user: admin@example.com / password123")
    
    db.close()
    print("Database initialization complete!")


if __name__ == "__main__":
    init_db()
