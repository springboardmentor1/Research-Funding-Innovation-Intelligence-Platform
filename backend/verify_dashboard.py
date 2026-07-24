import os
import sys

# 1. Override the database URL to use SQLite for self-contained testing
os.environ["DATABASE_URL"] = "sqlite:///./verify_test.db"

# 2. Cleanup any previous database file
if os.path.exists("verify_test.db"):
    try:
        os.remove("verify_test.db")
    except Exception:
        pass

try:
    from fastapi.testclient import TestClient
    from app.main import app
    from app.database.connection import engine, Base
    from app.services import dashboard_service
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

# Initialize database tables for verification
Base.metadata.create_all(bind=engine)
client = TestClient(app)

checklist = {
    "Publication Dashboard Loaded": False,
    "Patent Dashboard Loaded": False,
    "Funding Dashboard Loaded": False,
    "Dashboard Summary Generated": False,
    "Unified Dashboard Built": False,
    "Dashboard API Response Valid": False,
    "JWT Authentication Passed": False
}

pub_data = None
patent_data = None
funding_data = None

try:
    # 1. Load Publication Dashboard Data
    pub_data = dashboard_service.load_publication_dashboard()
    if isinstance(pub_data, dict) and "summary_metrics" in pub_data:
        checklist["Publication Dashboard Loaded"] = True
except Exception:
    pass

try:
    # 2. Load Patent Dashboard Data
    patent_data = dashboard_service.load_patent_dashboard()
    if isinstance(patent_data, dict) and "summary_metrics" in patent_data:
        checklist["Patent Dashboard Loaded"] = True
except Exception:
    pass

try:
    # 3. Load Funding Dashboard Data
    funding_data = dashboard_service.load_funding_dashboard()
    if isinstance(funding_data, dict) and "summary_metrics" in funding_data:
        checklist["Funding Dashboard Loaded"] = True
except Exception:
    pass

try:
    # 4. Generate Dashboard Summary
    if pub_data and patent_data and funding_data:
        summary = dashboard_service.build_dashboard_summary(pub_data, patent_data, funding_data)
        required_keys = [
            "total_publications",
            "total_patents",
            "total_funding_opportunities",
            "total_research_domains",
            "total_countries",
            "total_funding_agencies",
            "last_analytics_update"
        ]
        missing = [k for k in required_keys if k not in summary]
        if not missing and summary["total_publications"] == 5000 and summary["total_patents"] == 5000 and summary["total_funding_opportunities"] == 5000 and summary["total_research_domains"] == 34 and summary["total_countries"] == 6 and summary["total_funding_agencies"] == 9:
            checklist["Dashboard Summary Generated"] = True
except Exception:
    pass

try:
    # 5. Build Unified Dashboard
    unified_data = dashboard_service.get_dashboard_data()
    if (isinstance(unified_data, dict) and 
        "summary" in unified_data and 
        "publications" in unified_data and 
        "patents" in unified_data and 
        "funding" in unified_data):
        checklist["Unified Dashboard Built"] = True
except Exception:
    pass

# Call Auth endpoints to test JWT protection
try:
    # Register a new user
    user_payload = {
        "full_name": "Test Researcher",
        "email": "test.dash@example.com",
        "password": "testpassword123",
        "role": "Researcher"
    }
    reg_response = client.post("/auth/register", json=user_payload)

    # Login user
    login_payload = {
        "username": "test.dash@example.com",
        "password": "testpassword123"
    }
    login_response = client.post("/auth/login", data=login_payload)
    token = login_response.json().get("access_token")

    if token:
        # Test 1: Unauthenticated request to /dashboard/analytics
        unauth_response = client.get("/dashboard/analytics")
        if unauth_response.status_code == 401:
            checklist["JWT Authentication Passed"] = True

        # Test 2: Authenticated request to /dashboard/analytics
        headers = {"Authorization": f"Bearer {token}"}
        auth_response = client.get("/dashboard/analytics", headers=headers)
        if auth_response.status_code == 200:
            res_data = auth_response.json()
            if "summary" in res_data and res_data["summary"].get("total_publications") == 5000:
                checklist["Dashboard API Response Valid"] = True
except Exception:
    pass

# Output verification results in exact requested format
print("=============================================")
print("RESEARCH INTELLIGENCE DASHBOARD")
print("=============================================")

print(f"[OK] Publication Dashboard Loaded" if checklist["Publication Dashboard Loaded"] else "[FAIL] Publication Dashboard Loaded")
print(f"[OK] Patent Dashboard Loaded" if checklist["Patent Dashboard Loaded"] else "[FAIL] Patent Dashboard Loaded")
print(f"[OK] Funding Dashboard Loaded" if checklist["Funding Dashboard Loaded"] else "[FAIL] Funding Dashboard Loaded")
print(f"[OK] Dashboard Summary Generated" if checklist["Dashboard Summary Generated"] else "[FAIL] Dashboard Summary Generated")
print(f"[OK] Unified Dashboard Built" if checklist["Unified Dashboard Built"] else "[FAIL] Unified Dashboard Built")
print(f"[OK] Dashboard API Response Valid" if checklist["Dashboard API Response Valid"] else "[FAIL] Dashboard API Response Valid")
print(f"[OK] JWT Authentication Passed" if checklist["JWT Authentication Passed"] else "[FAIL] JWT Authentication Passed")

print("=============================================")
if all(checklist.values()):
    print("Verification completed successfully.")
    exit_code = 0
else:
    print("Verification failed.")
    exit_code = 1

# Cleanup database file
if os.path.exists("verify_test.db"):
    try:
        os.remove("verify_test.db")
    except Exception:
        pass

sys.exit(exit_code)
