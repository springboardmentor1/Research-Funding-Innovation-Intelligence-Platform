import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import get_db, Base, engine
from app.models.user import User
from app.utils.security import get_password_hash, create_access_token

client = TestClient(app)

def run_full_flow():
    print("==========================================================================")
    print("      RESEARCH FUNDING & INNOVATION INTELLIGENCE PLATFORM")
    print("               MILESTONE 4 FULL-FLOW VERIFICATION")
    print("==========================================================================")

    Base.metadata.create_all(bind=engine)
    db = next(get_db())

    # 1. User Register & Authentication
    print("\n--- PHASE 1: User Registration & OAuth2 JWT Auth ---")
    reg_payload = {
        "full_name": "Dr. Sarah Connor",
        "email": "sarah.connor.m4@cyberdyne.org",
        "password": "securepassword123",
        "role": "Administrator"
    }
    res_reg = client.post("/auth/register", json=reg_payload)
    print(f"   [1.1] User Registration: HTTP {res_reg.status_code}")
    
    login_payload = {
        "email": "sarah.connor.m4@cyberdyne.org",
        "password": "securepassword123"
    }
    res_login = client.post("/auth/login-json", json=login_payload)
    assert res_login.status_code == 200, f"Login failed: {res_login.text}"
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"   [1.2] JWT Bearer Token Issued Successfully: {token[:20]}...")

    # 2. Executive Dashboards Verification
    print("\n--- PHASE 2: Role-Based Executive Dashboards ---")
    roles = ["admin", "manager", "researcher", "startup"]
    for role_name in roles:
        res_exec = client.get(f"/executive/{role_name}", headers=headers)
        assert res_exec.status_code == 200, f"Failed for {role_name}: {res_exec.text}"
        print(f"   [2.{roles.index(role_name)+1}] GET /executive/{role_name} -> 200 OK")

    # 3. Reports Engine Verification
    print("\n--- PHASE 3: Reports Generator & File Storage ---")
    res_types = client.get("/reports/types", headers=headers)
    assert res_types.status_code == 200
    print("   [3.1] GET /reports/types -> 200 OK")

    for fmt in ["pdf", "csv", "json"]:
        gen_payload = {
            "report_type": "patent_landscape",
            "format": fmt,
            "domain": "Robotics & AI"
        }
        res_gen = client.post("/reports/generate", json=gen_payload, headers=headers)
        assert res_gen.status_code == 200
        rep_id = res_gen.json()["report_id"]
        print(f"   [3.2] POST /reports/generate ({fmt.upper()}) -> Generated {rep_id}")

        res_dl = client.get(f"/reports/download/{rep_id}", headers=headers)
        assert res_dl.status_code == 200
        print(f"   [3.3] GET /reports/download/{rep_id} -> Downloaded ({len(res_dl.content)} bytes)")

    # 4. Existing Intelligence Services Check (Milestones 1-3)
    print("\n--- PHASE 4: Milestones 1-3 Core Systems Integrity Check ---")
    res_dash = client.get("/dashboard/analytics", headers=headers)
    assert res_dash.status_code == 200
    print("   [4.1] GET /dashboard/analytics -> 200 OK")

    res_innov = client.get("/innovation/dashboard", headers=headers)
    assert res_innov.status_code == 200
    print("   [4.2] GET /innovation/dashboard -> 200 OK")

    print("\n==========================================================================")
    print(">>> SUCCESS! MILESTONE 4 END-TO-END WORKFLOW VERIFIED PERFECTLY.")
    print("==========================================================================\n")

if __name__ == "__main__":
    run_full_flow()
