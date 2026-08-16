import sys
import os

# Add backend root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import get_db, Base, engine
from app.models.user import User
from app.utils.security import get_password_hash, create_access_token

client = TestClient(app)

def setup_test_users():
    """Ensure database has one user for each role for testing."""
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    
    roles = ["Administrator", "Innovation Manager", "Researcher", "Startup Founder"]
    tokens = {}
    
    for role in roles:
        email = f"test.{role.lower().replace(' ', '')}@example.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                full_name=f"Test {role}",
                email=email,
                hashed_password=get_password_hash("password123"),
                role=role
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        token = create_access_token(subject=user.id)
        tokens[role] = token
        
    return tokens

def test_executive_dashboards():
    print("=== Step 1 Verification: Executive Dashboard Backend APIs ===")
    tokens = setup_test_users()
    
    # 1. Test Admin Dashboard Endpoint
    print("\n1. Testing GET /executive/admin...")
    headers_admin = {"Authorization": f"Bearer {tokens['Administrator']}"}
    res = client.get("/executive/admin", headers=headers_admin)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "system_health" in data
    assert "user_analytics" in data
    print("   [OK] Administrator Dashboard Endpoint Verified (200 OK)")

    # Test RBAC rejection on Admin endpoint
    headers_researcher = {"Authorization": f"Bearer {tokens['Researcher']}"}
    res_rbac = client.get("/executive/admin", headers=headers_researcher)
    assert res_rbac.status_code == 403, f"Expected 403 Forbidden, got {res_rbac.status_code}"
    print("   [OK] RBAC Protection Verified (403 Forbidden for non-admin)")

    # 2. Test Innovation Manager Dashboard Endpoint
    print("\n2. Testing GET /executive/manager...")
    headers_manager = {"Authorization": f"Bearer {tokens['Innovation Manager']}"}
    res = client.get("/executive/manager", headers=headers_manager)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "summary_kpis" in data
    assert "tech_transfer_pipeline" in data
    print("   [OK] Innovation Manager Dashboard Endpoint Verified (200 OK)")

    # 3. Test Researcher Dashboard Endpoint
    print("\n3. Testing GET /executive/researcher...")
    res = client.get("/executive/researcher", headers=headers_researcher)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "bibliometrics" in data
    assert "grant_matches" in data
    print("   [OK] Researcher Dashboard Endpoint Verified (200 OK)")

    # 4. Test Startup Founder Dashboard Endpoint
    print("\n4. Testing GET /executive/startup...")
    headers_startup = {"Authorization": f"Bearer {tokens['Startup Founder']}"}
    res = client.get("/executive/startup", headers=headers_startup)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "startup_standing" in data
    assert "commercialization_radar" in data
    print("   [OK] Startup Founder Dashboard Endpoint Verified (200 OK)")

    # 5. Test Unauthenticated Request Rejection
    print("\n5. Testing Unauthenticated Request...")
    res_unauth = client.get("/executive/admin")
    assert res_unauth.status_code == 401, f"Expected 401 Unauthorized, got {res_unauth.status_code}"
    print("   [OK] Unauthenticated Request Rejected (401 Unauthorized)")

    print("\n=======================================================")
    print(">>> STEP 1 VERIFICATION PASSED SUCCESSFULLY! ALL EXECUTIVE DASHBOARD APIS ARE OPERATIONAL.")
    print("=======================================================\n")

if __name__ == "__main__":
    test_executive_dashboards()
