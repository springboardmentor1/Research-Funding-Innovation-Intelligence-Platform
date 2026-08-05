import os
import sys

# Set database URL to use SQLite for self-contained test environment
os.environ["DATABASE_URL"] = "sqlite:///./verify_test.db"

# Cleanup any previous verification database
if os.path.exists("verify_test.db"):
    try:
        os.remove("verify_test.db")
    except Exception:
        pass

try:
    from fastapi.testclient import TestClient
    from app.main import app
    from app.database.connection import engine, Base
    from app.services import innovation_dashboard_service
except ImportError as e:
    print(f"Error importing required backend modules: {e}")
    sys.exit(1)

# Initialize test database tables
Base.metadata.create_all(bind=engine)
client = TestClient(app)

checklist = {
    "Patent Landscape Loaded": False,
    "Technology Intelligence Loaded": False,
    "Innovation Scores Loaded": False,
    "Commercialization Loaded": False,
    "Dashboard Summary Generated": False,
    "Metadata Generated": False,
    "KPI Metrics Validated": False,
    "Dashboard JSON Structure Valid": False,
    "API Response Valid": False,
    "JWT Authentication Passed": False
}

try:
    # 1. Load Patent Landscape Dashboard
    patent_dash = innovation_dashboard_service.load_patent_landscape_dashboard()
    if isinstance(patent_dash, dict) and len(patent_dash) > 0:
        checklist["Patent Landscape Loaded"] = True

    # 2. Load Technology Intelligence Dashboard
    tech_dash = innovation_dashboard_service.load_technology_dashboard()
    if isinstance(tech_dash, dict) and len(tech_dash) > 0:
        checklist["Technology Intelligence Loaded"] = True

    # 3. Load Innovation Dashboard
    innov_dash = innovation_dashboard_service.load_innovation_dashboard()
    if isinstance(innov_dash, dict) and len(innov_dash) > 0:
        checklist["Innovation Scores Loaded"] = True

    # 4. Load Commercialization Dashboard
    comm_dash = innovation_dashboard_service.load_commercialization_dashboard()
    if isinstance(comm_dash, dict) and len(comm_dash) > 0:
        checklist["Commercialization Loaded"] = True

    # 5. Build & Verify Dashboard Summary
    summary = innovation_dashboard_service.build_dashboard_summary(
        patent_dash, tech_dash, innov_dash, comm_dash
    )
    if isinstance(summary, dict) and "total_domains" in summary and "average_innovation_score" in summary:
        checklist["Dashboard Summary Generated"] = True

    # 6. Build & Verify Health Metadata
    metadata = innovation_dashboard_service.build_dashboard_metadata()
    if isinstance(metadata, dict) and metadata.get("analytics_status") == "Healthy" and metadata.get("modules_loaded") == 4:
        checklist["Metadata Generated"] = True

    # 7. Validate KPI Metrics
    if (
        summary.get("total_domains", 0) > 0 and
        summary.get("average_innovation_score", 0) >= 0 and
        summary.get("average_opportunity_score", 0) >= 0 and
        "last_updated" in summary
    ):
        checklist["KPI Metrics Validated"] = True

    # 8. Verify Unified Dashboard Structure
    full_dash = innovation_dashboard_service.get_innovation_dashboard(user_role="Administrator")
    required_sections = ["summary", "metadata", "patent_landscape", "technology_intelligence", "innovation_scores", "commercialization"]
    if isinstance(full_dash, dict) and all(sec in full_dash for sec in required_sections):
        checklist["Dashboard JSON Structure Valid"] = True

    # 9. Test JWT Authentication & REST API Endpoint
    reg_payload = {
        "full_name": "Dr. Executive Manager",
        "email": "executive.manager@example.com",
        "password": "securepassword123",
        "role": "Innovation Manager"
    }
    client.post("/auth/register", json=reg_payload)

    login_payload = {
        "username": "executive.manager@example.com",
        "password": "securepassword123"
    }
    login_res = client.post("/auth/login", data=login_payload)
    token = login_res.json().get("access_token")

    if token:
        # Check unauthenticated access receives 401
        unauth_res = client.get("/innovation/dashboard")
        if unauth_res.status_code == 401:
            checklist["JWT Authentication Passed"] = True

        # Check authenticated access receives 200 with complete dashboard data
        headers = {"Authorization": f"Bearer {token}"}
        auth_res = client.get("/innovation/dashboard", headers=headers)
        if auth_res.status_code == 200:
            res_json = auth_res.json()
            if "summary" in res_json and "metadata" in res_json and "commercialization" in res_json:
                checklist["API Response Valid"] = True

except Exception as e:
    print(f"Error during verification: {e}")

print("=============================================")
print("INNOVATION ANALYTICS DASHBOARD")
print("=============================================")
print()
print("[OK] Patent Landscape Loaded" if checklist["Patent Landscape Loaded"] else "[FAIL] Patent Landscape Loaded")
print()
print("[OK] Technology Intelligence Loaded" if checklist["Technology Intelligence Loaded"] else "[FAIL] Technology Intelligence Loaded")
print()
print("[OK] Innovation Scores Loaded" if checklist["Innovation Scores Loaded"] else "[FAIL] Innovation Scores Loaded")
print()
print("[OK] Commercialization Loaded" if checklist["Commercialization Loaded"] else "[FAIL] Commercialization Loaded")
print()
print("[OK] Dashboard Summary Generated" if checklist["Dashboard Summary Generated"] else "[FAIL] Dashboard Summary Generated")
print()
print("[OK] Metadata Generated" if checklist["Metadata Generated"] else "[FAIL] Metadata Generated")
print()
print("[OK] KPI Metrics Validated" if checklist["KPI Metrics Validated"] else "[FAIL] KPI Metrics Validated")
print()
print("[OK] Dashboard JSON Structure Valid" if checklist["Dashboard JSON Structure Valid"] else "[FAIL] Dashboard JSON Structure Valid")
print()
print("[OK] API Response Valid" if checklist["API Response Valid"] else "[FAIL] API Response Valid")
print()
print("[OK] JWT Authentication Passed" if checklist["JWT Authentication Passed"] else "[FAIL] JWT Authentication Passed")
print()
print("=============================================")
print()

if all(checklist.values()):
    print("Verification completed successfully.")
    exit_code = 0
else:
    print("Verification failed.")
    exit_code = 1

# Clean up verification database file
if os.path.exists("verify_test.db"):
    try:
        os.remove("verify_test.db")
    except Exception:
        pass

sys.exit(exit_code)
