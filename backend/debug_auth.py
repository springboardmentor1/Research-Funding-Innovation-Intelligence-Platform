import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Test database connection
try:
    from app.database.database import SessionLocal, engine
    from app.models import User, Role, Organization
    from app.auth.hashing import verify_password, hash_password
    
    print("Testing database connection...")
    db = SessionLocal()
    
    # Test basic query
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users")
        
        if len(users) == 0:
            print("No users found. Creating test user...")
            # Create a simple test user
            admin_role = Role(role_name="Admin")
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)
            
            demo_org = Organization(
                organization_name="Test Org",
                organization_type="University",
                country="USA"
            )
            db.add(demo_org)
            db.commit()
            db.refresh(demo_org)
            
            test_user = User(
                full_name="Test Admin",
                email="test@test.com",
                password_hash=hash_password("test123"),
                role_id=admin_role.id,
                organization_id=demo_org.id
            )
            db.add(test_user)
            db.commit()
            print("Test user created: test@test.com / test123")
        else:
            for user in users:
                print(f"User: {user.email}, Role ID: {user.role_id}")
                
                # Test password verification
                if user.email == "admin@demo.edu":
                    print(f"Testing password for {user.email}...")
                    if verify_password("admin123", user.password_hash):
                        print("Password verification SUCCESS")
                    else:
                        print("Password verification FAILED")
                        # Recreate with correct hash
                        user.password_hash = hash_password("admin123")
                        db.commit()
                        print("Password reset to admin123")
        
        db.close()
        print("Database test completed successfully")
        
    except Exception as e:
        print(f"Database query error: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        
except Exception as e:
    print(f"Import error: {e}")
    import traceback
    traceback.print_exc()