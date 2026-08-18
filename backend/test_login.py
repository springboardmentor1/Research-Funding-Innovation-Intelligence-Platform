from app.database.database import SessionLocal
from app.models import User, Role, Organization
from app.auth.hashing import verify_password

def test_login():
    db = SessionLocal()
    
    try:
        # Check if users exist
        users = db.query(User).all()
        print(f"Found {len(users)} users in database")
        
        for user in users:
            print(f"\nUser: {user.email}")
            print(f"Full Name: {user.full_name}")
            print(f"Role ID: {user.role_id}")
            print(f"Organization ID: {user.organization_id}")
            
            # Try to access role
            try:
                print(f"Role: {user.role.role_name}")
            except Exception as e:
                print(f"Error accessing role: {e}")
            
            # Try to access organization
            try:
                print(f"Organization: {user.organization.organization_name}")
            except Exception as e:
                print(f"Error accessing organization: {e}")
        
        # Test specific login
        print("\n" + "="*50)
        print("Testing login for admin@demo.edu")
        print("="*50)
        
        user = db.query(User).filter(User.email == "admin@demo.edu").first()
        
        if user:
            print(f"User found: {user.email}")
            print(f"Testing password verification...")
            
            if verify_password("admin123", user.password_hash):
                print("✓ Password verification successful")
            else:
                print("✗ Password verification failed")
                
            # Test with wrong password
            if verify_password("wrongpassword", user.password_hash):
                print("✗ Wrong password accepted (this is bad)")
            else:
                print("✓ Wrong password rejected (this is good)")
        else:
            print("✗ User not found")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_login()