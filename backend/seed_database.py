from app.database.database import SessionLocal, engine, Base
from app.models import User, Role, Organization
from app.auth.hashing import hash_password

def seed_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_roles = db.query(Role).first()
        if existing_roles:
            print("Database already seeded. Skipping...")
            return
        
        # Create Roles
        admin_role = Role(role_name="Admin")
        researcher_role = Role(role_name="Researcher")
        org_admin_role = Role(role_name="Organization Admin")
        
        db.add_all([admin_role, researcher_role, org_admin_role])
        db.commit()
        db.refresh(admin_role)
        db.refresh(researcher_role)
        db.refresh(org_admin_role)
        
        print("✓ Created roles")
        
        # Create Organization
        demo_org = Organization(
            organization_name="Demo University",
            organization_type="University",
            country="USA",
            website="https://demo.edu"
        )
        
        db.add(demo_org)
        db.commit()
        db.refresh(demo_org)
        
        print("✓ Created organization")
        
        # Create Test Users
        test_users = [
            {
                "full_name": "Admin User",
                "email": "admin@demo.edu",
                "password": "admin123",
                "role_id": admin_role.id,
                "organization_id": demo_org.id
            },
            {
                "full_name": "John Researcher",
                "email": "researcher@demo.edu", 
                "password": "research123",
                "role_id": researcher_role.id,
                "organization_id": demo_org.id
            },
            {
                "full_name": "Jane Scientist",
                "email": "jane@demo.edu",
                "password": "science123",
                "role_id": researcher_role.id,
                "organization_id": demo_org.id
            }
        ]
        
        for user_data in test_users:
            new_user = User(
                full_name=user_data["full_name"],
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role_id=user_data["role_id"],
                organization_id=user_data["organization_id"]
            )
            db.add(new_user)
        
        db.commit()
        print("✓ Created test users")
        
        print("\n" + "="*50)
        print("DATABASE SEEDED SUCCESSFULLY!")
        print("="*50)
        print("\nTest Accounts:")
        print("-" * 30)
        for user_data in test_users:
            print(f"Email: {user_data['email']}")
            print(f"Password: {user_data['password']}")
            print(f"Role: {user_data['role_id']}")
            print("-" * 30)
        
        print("\nYou can now:")
        print("1. Login with these test accounts")
        print("2. Register new accounts via the frontend")
        print("3. Role ID 1 = Admin, 2 = Researcher, 3 = Organization Admin")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()