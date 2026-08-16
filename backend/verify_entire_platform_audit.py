import sys
import os
import json

# Add backend root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import get_db, Base, engine
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent

client = TestClient(app)

def run_comprehensive_audit():
    print("==========================================================================================")
    print("           RESEARCH FUNDING & INNOVATION INTELLIGENCE PLATFORM")
    print("                  FULL SYSTEM & API ENDPOINT RUNTIME AUDIT")
    print("==========================================================================================")

    # Reset/Ensure database schema initialization
    Base.metadata.create_all(bind=engine)
    db = next(get_db())

    audit_results = []

    def record_result(endpoint, category, status_code, status_str, detail=""):
        audit_results.append({
            "endpoint": endpoint,
            "category": category,
            "status_code": status_code,
            "status": status_str,
            "detail": detail
        })
        icon = "[OK]" if status_str == "PASSED" else "[FAIL]"
        print(f"   {icon} {endpoint} -> HTTP {status_code} ({status_str}): {detail}")

    # -------------------------------------------------------------------------
    # 1. Root & System Health
    # -------------------------------------------------------------------------
    print("\n--- 1. Testing Root & Core Health Endpoints ---")
    res_home = client.get("/")
    if res_home.status_code == 200 and "message" in res_home.json():
        record_result("GET /", "Health", res_home.status_code, "PASSED", "API Home Welcome String Verified")
    else:
        record_result("GET /", "Health", res_home.status_code, "FAILED", res_home.text)

    # -------------------------------------------------------------------------
    # 2. Authentication & User Registration (All 4 Roles + Form Data Login)
    # -------------------------------------------------------------------------
    print("\n--- 2. Testing User Registration, Authentication & RBAC ---")
    roles = ["Researcher", "Startup Founder", "Innovation Manager", "Administrator"]
    tokens = {}

    for r in roles:
        email = f"audit.{r.lower().replace(' ', '')}@cyberdyne.org"
        password = "securepassword123"
        reg_payload = {
            "full_name": f"Dr. Audit {r}",
            "email": email,
            "password": password,
            "role": r
        }
        res_reg = client.post("/auth/register", json=reg_payload)
        if res_reg.status_code in [201, 400]:
            record_result(f"POST /auth/register ({r})", "Auth", res_reg.status_code, "PASSED", f"Role '{r}' registered")
        else:
            record_result(f"POST /auth/register ({r})", "Auth", res_reg.status_code, "FAILED", res_reg.text)

        # Login JSON
        res_login = client.post("/auth/login-json", json={"email": email, "password": password})
        if res_login.status_code == 200:
            data = res_login.json()
            tokens[r] = data["access_token"]
            record_result(f"POST /auth/login-json ({r})", "Auth", res_login.status_code, "PASSED", f"JWT Issued for {r}")
        else:
            record_result(f"POST /auth/login-json ({r})", "Auth", res_login.status_code, "FAILED", res_login.text)

    # Test OAuth2 Form Data login
    res_form_login = client.post("/auth/login", data={"username": "audit.researcher@cyberdyne.org", "password": "securepassword123"})
    if res_form_login.status_code == 200:
        record_result("POST /auth/login (OAuth2 Form)", "Auth", res_form_login.status_code, "PASSED", "Form Data authentication verified")
    else:
        record_result("POST /auth/login (OAuth2 Form)", "Auth", res_form_login.status_code, "FAILED", res_form_login.text)

    # Verify GET /auth/me
    headers_researcher = {"Authorization": f"Bearer {tokens['Researcher']}"}
    res_me = client.get("/auth/me", headers=headers_researcher)
    if res_me.status_code == 200 and res_me.json().get("email") == "audit.researcher@cyberdyne.org":
        record_result("GET /auth/me", "Auth", res_me.status_code, "PASSED", "Fetched authenticated user payload")
    else:
        record_result("GET /auth/me", "Auth", res_me.status_code, "FAILED", res_me.text)

    # Verify GET /auth/admin-only RBAC check
    headers_admin = {"Authorization": f"Bearer {tokens['Administrator']}"}
    res_admin_ok = client.get("/auth/admin-only", headers=headers_admin)
    if res_admin_ok.status_code == 200:
        record_result("GET /auth/admin-only (Admin User)", "RBAC", res_admin_ok.status_code, "PASSED", "Admin authorized")
    else:
        record_result("GET /auth/admin-only (Admin User)", "RBAC", res_admin_ok.status_code, "FAILED", res_admin_ok.text)

    res_admin_rej = client.get("/auth/admin-only", headers=headers_researcher)
    if res_admin_rej.status_code == 403:
        record_result("GET /auth/admin-only (Researcher User)", "RBAC", res_admin_rej.status_code, "PASSED", "403 Forbidden enforced")
    else:
        record_result("GET /auth/admin-only (Researcher User)", "RBAC", res_admin_rej.status_code, "FAILED", res_admin_rej.text)

    # -------------------------------------------------------------------------
    # 3. Research Profile Management & Database Table State
    # -------------------------------------------------------------------------
    print("\n--- 3. Testing Research Profile CRUD Operations & Database Persistence ---")
    profile_payload = {
        "research_domain": "Robotics & AI",
        "research_subdomain": "Autonomous Control Systems",
        "keywords": "neural networks, robotics, autonomous hardware",
        "organization": "Cyberdyne Research Labs",
        "designation": "Principal Investigator"
    }

    # Clean existing profile if any
    client.delete("/profile", headers=headers_researcher)

    # Create Profile
    res_prof_create = client.post("/profile", json=profile_payload, headers=headers_researcher)
    if res_prof_create.status_code == 201:
        record_result("POST /profile", "Profile", res_prof_create.status_code, "PASSED", "Profile created in Database")
    else:
        record_result("POST /profile", "Profile", res_prof_create.status_code, "FAILED", res_prof_create.text)

    # Fetch Profile GET /profile/me
    res_prof_me = client.get("/profile/me", headers=headers_researcher)
    if res_prof_me.status_code == 200 and res_prof_me.json().get("research_domain") == "Robotics & AI":
        record_result("GET /profile/me", "Profile", res_prof_me.status_code, "PASSED", "Fetched profile metadata")
    else:
        record_result("GET /profile/me", "Profile", res_prof_me.status_code, "FAILED", res_prof_me.text)

    # Update Profile PUT /profile
    update_payload = {"designation": "Director of Research"}
    res_prof_put = client.put("/profile", json=update_payload, headers=headers_researcher)
    if res_prof_put.status_code == 200 and res_prof_put.json().get("designation") == "Director of Research":
        record_result("PUT /profile", "Profile", res_prof_put.status_code, "PASSED", "Profile updated in DB")
    else:
        record_result("PUT /profile", "Profile", res_prof_put.status_code, "FAILED", res_prof_put.text)

    # Test DELETE /profile
    res_prof_del = client.delete("/profile", headers=headers_researcher)
    if res_prof_del.status_code == 200:
        record_result("DELETE /profile", "Profile", res_prof_del.status_code, "PASSED", "Profile deleted from DB")
    else:
        record_result("DELETE /profile", "Profile", res_prof_del.status_code, "FAILED", res_prof_del.text)

    # Re-create profile for subsequent searches
    res_prof_recreate = client.post("/profile", json=profile_payload, headers=headers_researcher)

    # -------------------------------------------------------------------------
    # 4. Publications Management & OpenAlex Sync
    # -------------------------------------------------------------------------
    print("\n--- 4. Testing Publications Search, Sync & Retrieval ---")
    res_pub_search = client.get("/publications/search?limit=5", headers=headers_researcher)
    if res_pub_search.status_code == 200 and isinstance(res_pub_search.json(), list):
        pubs = res_pub_search.json()
        record_result("GET /publications/search", "Publications", res_pub_search.status_code, "PASSED", f"Synced {len(pubs)} papers from OpenAlex")
        
        # Test GET /publications list
        res_pubs_list = client.get("/publications", headers=headers_researcher)
        if res_pubs_list.status_code == 200:
            record_result("GET /publications", "Publications", res_pubs_list.status_code, "PASSED", f"Retrieved {len(res_pubs_list.json())} stored publications from DB")
        else:
            record_result("GET /publications", "Publications", res_pubs_list.status_code, "FAILED", res_pubs_list.text)

        # Test GET /publications/{id}
        if len(pubs) > 0:
            pub_id = pubs[0].get("publication_id")
            res_pub_single = client.get(f"/publications/{pub_id}", headers=headers_researcher)
            if res_pub_single.status_code == 200:
                record_result(f"GET /publications/{pub_id}", "Publications", res_pub_single.status_code, "PASSED", "Fetched single publication metadata")
            else:
                record_result(f"GET /publications/{pub_id}", "Publications", res_pub_single.status_code, "FAILED", res_pub_single.text)
    else:
        record_result("GET /publications/search", "Publications", res_pub_search.status_code, "FAILED", res_pub_search.text)

    # -------------------------------------------------------------------------
    # 5. Patent Management & Lens API Sync
    # -------------------------------------------------------------------------
    print("\n--- 5. Testing Patent Search, Sync & Retrieval ---")
    res_pat_search = client.get("/patents/search?limit=5", headers=headers_researcher)
    if res_pat_search.status_code == 200 and isinstance(res_pat_search.json(), list):
        pats = res_pat_search.json()
        record_result("GET /patents/search", "Patents", res_pat_search.status_code, "PASSED", f"Synced {len(pats)} patents from Lens API")

        # Test GET /patents list
        res_pats_list = client.get("/patents", headers=headers_researcher)
        if res_pats_list.status_code == 200:
            record_result("GET /patents", "Patents", res_pats_list.status_code, "PASSED", f"Retrieved {len(res_pats_list.json())} stored patents from DB")
        else:
            record_result("GET /patents", "Patents", res_pats_list.status_code, "FAILED", res_pats_list.text)

        # Test GET /patents/{id}
        if len(pats) > 0:
            pat_id = pats[0].get("patent_id")
            res_pat_single = client.get(f"/patents/{pat_id}", headers=headers_researcher)
            if res_pat_single.status_code == 200:
                record_result(f"GET /patents/{pat_id}", "Patents", res_pat_single.status_code, "PASSED", "Fetched single patent metadata")
            else:
                record_result(f"GET /patents/{pat_id}", "Patents", res_pat_single.status_code, "FAILED", res_pat_single.text)
    else:
        record_result("GET /patents/search", "Patents", res_pat_search.status_code, "FAILED", res_pat_search.text)

    # -------------------------------------------------------------------------
    # 6. Grant Recommendations & Funding Engine
    # -------------------------------------------------------------------------
    print("\n--- 6. Testing Funding Recommendations Engine ---")
    res_funding = client.get("/funding/recommendations", headers=headers_researcher)
    if res_funding.status_code == 200 and "recommendations" in res_funding.json():
        recs = res_funding.json()["recommendations"]
        record_result("GET /funding/recommendations", "Funding", res_funding.status_code, "PASSED", f"Retrieved {len(recs)} grant call matches")
    else:
        record_result("GET /funding/recommendations", "Funding", res_funding.status_code, "FAILED", res_funding.text)

    # -------------------------------------------------------------------------
    # 7. Unified Dashboards (Milestones 2 & 3)
    # -------------------------------------------------------------------------
    print("\n--- 7. Testing Research & Innovation Intelligence Dashboards ---")
    res_dash = client.get("/dashboard/analytics", headers=headers_researcher)
    if res_dash.status_code == 200 and "summary" in res_dash.json():
        record_result("GET /dashboard/analytics", "Dashboard", res_dash.status_code, "PASSED", "Retrieved publication, patent & funding summary")
    else:
        record_result("GET /dashboard/analytics", "Dashboard", res_dash.status_code, "FAILED", res_dash.text)

    res_innov = client.get("/innovation/dashboard", headers=headers_researcher)
    if res_innov.status_code == 200 and "summary_kpis" in res_innov.json():
        record_result("GET /innovation/dashboard", "Dashboard", res_innov.status_code, "PASSED", "Retrieved innovation matrix & TRL metrics")
    else:
        record_result("GET /innovation/dashboard", "Dashboard", res_innov.status_code, "FAILED", res_innov.text)

    # -------------------------------------------------------------------------
    # 8. Milestone 4 Executive Dashboards (All 4 Roles)
    # -------------------------------------------------------------------------
    print("\n--- 8. Testing Role-Based Executive Dashboards ---")
    res_ex_admin = client.get("/executive/admin", headers=headers_admin)
    if res_ex_admin.status_code == 200 and "system_health" in res_ex_admin.json():
        record_result("GET /executive/admin", "Executive", res_ex_admin.status_code, "PASSED", "Admin Executive Console payload valid")
    else:
        record_result("GET /executive/admin", "Executive", res_ex_admin.status_code, "FAILED", res_ex_admin.text)

    headers_manager = {"Authorization": f"Bearer {tokens['Innovation Manager']}"}
    res_ex_mgr = client.get("/executive/manager", headers=headers_manager)
    if res_ex_mgr.status_code == 200 and "tech_transfer_pipeline" in res_ex_mgr.json():
        record_result("GET /executive/manager", "Executive", res_ex_mgr.status_code, "PASSED", "Manager Executive Console payload valid")
    else:
        record_result("GET /executive/manager", "Executive", res_ex_mgr.status_code, "FAILED", res_ex_mgr.text)

    res_ex_res = client.get("/executive/researcher", headers=headers_researcher)
    if res_ex_res.status_code == 200 and "bibliometrics" in res_ex_res.json():
        record_result("GET /executive/researcher", "Executive", res_ex_res.status_code, "PASSED", "Researcher Personal Console payload valid")
    else:
        record_result("GET /executive/researcher", "Executive", res_ex_res.status_code, "FAILED", res_ex_res.text)

    headers_startup = {"Authorization": f"Bearer {tokens['Startup Founder']}"}
    res_ex_startup = client.get("/executive/startup", headers=headers_startup)
    if res_ex_startup.status_code == 200 and "commercialization_radar" in res_ex_startup.json():
        record_result("GET /executive/startup", "Executive", res_ex_startup.status_code, "PASSED", "Startup Founder Console payload valid")
    else:
        record_result("GET /executive/startup", "Executive", res_ex_startup.status_code, "FAILED", res_ex_startup.text)

    # -------------------------------------------------------------------------
    # 9. Reports Engine & Disk Storage Strategy
    # -------------------------------------------------------------------------
    print("\n--- 9. Testing Reports Generator, Storage & Download ---")
    res_rep_types = client.get("/reports/types", headers=headers_admin)
    if res_rep_types.status_code == 200 and "report_types" in res_rep_types.json():
        record_result("GET /reports/types", "Reports", res_rep_types.status_code, "PASSED", "Report categories retrieved")
    else:
        record_result("GET /reports/types", "Reports", res_rep_types.status_code, "FAILED", res_rep_types.text)

    # Generate PDF Report
    gen_payload = {
        "report_type": "patent_landscape",
        "format": "pdf",
        "domain": "Robotics & AI"
    }
    res_rep_gen = client.post("/reports/generate", json=gen_payload, headers=headers_admin)
    if res_rep_gen.status_code == 200:
        rep_id = res_rep_gen.json()["report_id"]
        record_result("POST /reports/generate", "Reports", res_rep_gen.status_code, "PASSED", f"Generated report '{rep_id}'")

        # Test download
        res_dl = client.get(f"/reports/download/{rep_id}", headers=headers_admin)
        if res_dl.status_code == 200 and len(res_dl.content) > 0:
            record_result(f"GET /reports/download/{rep_id}", "Reports", res_dl.status_code, "PASSED", f"Downloaded {len(res_dl.content)} bytes")
        else:
            record_result(f"GET /reports/download/{rep_id}", "Reports", res_dl.status_code, "FAILED", res_dl.text)
    else:
        record_result("POST /reports/generate", "Reports", res_rep_gen.status_code, "FAILED", res_rep_gen.text)

    # Test GET /reports/list
    res_rep_list = client.get("/reports/list", headers=headers_admin)
    if res_rep_list.status_code == 200 and "reports" in res_rep_list.json():
        record_result("GET /reports/list", "Reports", res_rep_list.status_code, "PASSED", f"History retrieved ({len(res_rep_list.json()['reports'])} files)")
    else:
        record_result("GET /reports/list", "Reports", res_rep_list.status_code, "FAILED", res_rep_list.text)

    # -------------------------------------------------------------------------
    # Database Table Record Audit Summary
    # -------------------------------------------------------------------------
    print("\n------------------------------------------------------------------------------------------")
    print("                      DATABASE TABLE PERSISTENCE & ROW COUNT AUDIT")
    print("------------------------------------------------------------------------------------------")
    user_count = db.query(User).count()
    profile_count = db.query(ResearchProfile).count()
    pub_count = db.query(Publication).count()
    pat_count = db.query(Patent).count()

    print(f"   [DB] User Table Records (`users`): {user_count} Rows")
    print(f"   [DB] Research Profile Records (`research_profiles`): {profile_count} Rows")
    print(f"   [DB] Publication Records (`publications`): {pub_count} Rows")
    print(f"   [DB] Patent Records (`patents`): {pat_count} Rows")

    # -------------------------------------------------------------------------
    # Final Result Matrix Summary
    # -------------------------------------------------------------------------
    passed_count = sum(1 for item in audit_results if item["status"] == "PASSED")
    failed_count = sum(1 for item in audit_results if item["status"] == "FAILED")
    total_count = len(audit_results)

    print("\n==========================================================================================")
    print(f"         FULL SYSTEM AUDIT SUMMARY: {passed_count}/{total_count} ENDPOINTS PASSED CLEANLY")
    print("==========================================================================================")
    if failed_count == 0:
        print(">>> RESULT: 100% OPERATIONAL! ALL API ENDPOINTS & DATABASE TRANSACTIONS ARE PERFECT.")
    else:
        print(f">>> WARNING: {failed_count} ENDPOINTS FAILED!")
        for f_item in audit_results:
            if f_item["status"] == "FAILED":
                print(f"    - FAILED: {f_item['endpoint']} -> {f_item['detail']}")
    print("==========================================================================================\n")

if __name__ == "__main__":
    run_comprehensive_audit()
