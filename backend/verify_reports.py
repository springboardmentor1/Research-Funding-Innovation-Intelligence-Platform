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

def setup_test_auth():
    """Ensure database has a test user to issue a JWT token."""
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    user = db.query(User).filter(User.email == "test.reporter@example.com").first()
    if not user:
        user = User(
            full_name="Report Generator Test",
            email="test.reporter@example.com",
            hashed_password=get_password_hash("password123"),
            role="Innovation Manager"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token(subject=user.id)
    return {"Authorization": f"Bearer {token}"}

def test_reports_engine():
    print("=== Step 3 Verification: Reports Engine Backend APIs ===")
    headers = setup_test_auth()

    # 1. Test GET /reports/types
    print("\n1. Testing GET /reports/types...")
    res = client.get("/reports/types", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "report_types" in data
    assert "supported_formats" in data
    print("   [OK] Report types endpoint verified (200 OK)")

    formats = ["pdf", "csv", "json"]
    report_types = ["patent_landscape", "technology_intelligence", "funding_matrix"]

    for fmt in formats:
        rep_type = report_types[formats.index(fmt)]
        print(f"\n2. Testing POST /reports/generate (Type: {rep_type}, Format: {fmt})...")
        payload = {
            "report_type": rep_type,
            "format": fmt,
            "domain": "Robotics & AI",
            "date_from": "2024-01-01",
            "date_to": "2026-08-16"
        }
        res_gen = client.post("/reports/generate", json=payload, headers=headers)
        assert res_gen.status_code == 200, f"Expected 200, got {res_gen.status_code}: {res_gen.text}"
        gen_data = res_gen.json()
        assert "report_id" in gen_data
        assert "filename" in gen_data
        assert "filepath" in gen_data
        
        report_id = gen_data["report_id"]
        filepath = gen_data["filepath"]
        assert os.path.exists(filepath), f"File {filepath} was not created!"
        print(f"   [OK] Report {report_id} generated & saved at {filepath}")

        # 3. Test Download endpoint
        print(f"   Testing GET /reports/download/{report_id}...")
        res_dl = client.get(f"/reports/download/{report_id}", headers=headers)
        assert res_dl.status_code == 200, f"Download failed with status {res_dl.status_code}"
        assert len(res_dl.content) > 0, "Downloaded file content is empty!"
        print(f"   [OK] Report download endpoint verified ({len(res_dl.content)} bytes retrieved)")

    # 4. Test GET /reports/list
    print("\n3. Testing GET /reports/list...")
    res_list = client.get("/reports/list", headers=headers)
    assert res_list.status_code == 200, f"Expected 200, got {res_list.status_code}"
    reports_history = res_list.json().get("reports", [])
    assert len(reports_history) >= 3
    print(f"   [OK] Report history list endpoint verified ({len(reports_history)} files found)")

    print("\n=======================================================")
    print(">>> STEP 3 VERIFICATION PASSED SUCCESSFULLY! REPORTS ENGINE IS FULLY OPERATIONAL.")
    print("=======================================================\n")

if __name__ == "__main__":
    test_reports_engine()
