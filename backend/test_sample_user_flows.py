import sys
import os
import json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database.connection import get_db, Base, engine
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent

client = TestClient(app)

def run_sample_user_tests():
    print("=" * 80)
    print("      COMPREHENSIVE END-TO-END SAMPLE LOGIN & INPUT TEST SUITE")
    print("=" * 80)

    Base.metadata.create_all(bind=engine)
    db = next(get_db())

    sample_users = [
        {
            "role": "Researcher",
            "name": "Dr. Durairam Scholar",
            "email": "durairam.researcher@cyberdyne.org",
            "password": "Password123!",
            "profile": {
                "research_domain": "Biotechnology & Artificial Intelligence",
                "research_subdomain": "Autonomous Systems & Bio-Engineering",
                "keywords": "biotechnology, neural networks, robotics, genetics",
                "organization": "Cyberdyne Research Labs",
                "designation": "Principal Investigator"
            }
        },
        {
            "role": "Startup Founder",
            "name": "Sarah Connor",
            "email": "sarah.startup@cyberdyne.org",
            "password": "Password123!",
            "profile": {
                "research_domain": "Quantum Computing & Microelectronics",
                "research_subdomain": "Semiconductor Hardware",
                "keywords": "quantum, chips, patents, hardware",
                "organization": "Skynet Innovations Inc.",
                "designation": "CEO & Founder"
            }
        },
        {
            "role": "Innovation Manager",
            "name": "Miles Dyson",
            "email": "miles.manager@cyberdyne.org",
            "password": "Password123!",
            "profile": {
                "research_domain": "Technology Transfer & Portfolio Analytics",
                "research_subdomain": "IP Strategy",
                "keywords": "technology transfer, commercialization, patents",
                "organization": "Global Innovation Hub",
                "designation": "VP of Technology Transfer"
            }
        },
        {
            "role": "Administrator",
            "name": "Admin System User",
            "email": "admin.system@cyberdyne.org",
            "password": "Password123!",
            "profile": {
                "research_domain": "Platform Administration & System Security",
                "research_subdomain": "Infrastructure",
                "keywords": "admin, security, user management",
                "organization": "Cyberdyne HQ",
                "designation": "Chief System Administrator"
            }
        }
    ]

    tokens = {}

    print("\n[STEP 1] Testing User Registration and Authentication for All 4 Roles:")
    for user_info in sample_users:
        # Register
        reg_res = client.post("/auth/register", json={
            "full_name": user_info["name"],
            "email": user_info["email"],
            "password": user_info["password"],
            "role": user_info["role"]
        })
        if reg_res.status_code in [201, 400]:
            print(f"  [OK] Register {user_info['role']} ({user_info['email']}): Status {reg_res.status_code}")
        else:
            print(f"  [FAIL] Register {user_info['role']}: {reg_res.text}")

        # Login JSON
        login_res = client.post("/auth/login-json", json={
            "email": user_info["email"],
            "password": user_info["password"]
        })
        assert login_res.status_code == 200, f"Login failed for {user_info['email']}: {login_res.text}"
        token = login_res.json()["access_token"]
        tokens[user_info["role"]] = token
        print(f"  [OK] Login {user_info['role']}: Issued JWT Token Successfully")

    print("\n[STEP 2] Testing Research Profile Creation & Updates:")
    for user_info in sample_users:
        role = user_info["role"]
        headers = {"Authorization": f"Bearer {tokens[role]}"}
        
        # Save profile
        prof_res = client.post("/profile", json=user_info["profile"], headers=headers)
        if prof_res.status_code == 400: # Profile already exists, update instead
            prof_res = client.put("/profile", json=user_info["profile"], headers=headers)
        
        assert prof_res.status_code in [200, 201], f"Profile save failed for {role}: {prof_res.text}"
        
        # Verify profile retrieval
        me_res = client.get("/profile/me", headers=headers)
        assert me_res.status_code == 200, f"Profile GET failed for {role}: {me_res.text}"
        data = me_res.json()
        print(f"  [OK] {role} Profile Context Verified: Domain = '{data['research_domain']}'")

    print("\n[STEP 3] Testing Live Literature Search & OpenAlex Sync (Sample Input: 'biotechnology'):")
    res_headers = {"Authorization": f"Bearer {tokens['Researcher']}"}
    
    # Live OpenAlex Sync with keyword
    openalex_res = client.get("/publications/search?keyword=biotechnology&limit=5", headers=res_headers)
    assert openalex_res.status_code == 200, f"OpenAlex sync failed: {openalex_res.text}"
    pubs = openalex_res.json()
    print(f"  [OK] OpenAlex API Synced {len(pubs)} publications for keyword 'biotechnology'.")
    if len(pubs) > 0:
        sample_pub = pubs[0]
        print(f"       Sample Paper Title: '{sample_pub['title'][:60]}...'")
        print(f"       Journal: {sample_pub['journal']} | Citations: {sample_pub['citation_count']}")

    print("\n[STEP 4] Testing Patent Landscape & Lens API Sync (Sample Input: 'patent'):")
    pat_res = client.get("/patents/search?limit=5", headers=res_headers)
    assert pat_res.status_code == 200, f"Patent sync failed: {pat_res.text}"
    patents = pat_res.json()
    print(f"  [OK] Patent Intelligence Engine Synced {len(patents)} patents.")
    if len(patents) > 0:
        sample_pat = patents[0]
        pat_num = sample_pat.get('external_patent_id') or sample_pat.get('patent_id') or 'PAT-001'
        print(f"       Sample Patent ID: {pat_num} | Title: '{sample_pat['title'][:60]}...'")

    print("\n[STEP 5] Testing Funding Opportunity Recommendations Engine:")
    funding_res = client.get("/funding/recommendations?limit=5", headers=res_headers)
    assert funding_res.status_code == 200, f"Funding search failed: {funding_res.text}"
    grants = funding_res.json().get("recommendations", [])
    print(f"  [OK] Generated {len(grants)} ranked funding call matches.")
    if len(grants) > 0:
        sample_grant = grants[0]
        print(f"       Top Grant Match: '{sample_grant['title']}' (Suitability Score: {sample_grant['match_score']}%)")

    print("\n[STEP 6] Testing Intelligence Report Generation & PDF Download:")
    admin_headers = {"Authorization": f"Bearer {tokens['Administrator']}"}
    report_gen = client.post("/reports/generate", json={
        "report_type": "patent_landscape",
        "format": "pdf",
        "domain": "Biotechnology & AI"
    }, headers=admin_headers)
    assert report_gen.status_code == 200, f"Report generation failed: {report_gen.text}"
    rep_id = report_gen.json()["report_id"]
    print(f"  [OK] Report Generated Successfully (ID: {rep_id})")

    download_res = client.get(f"/reports/download/{rep_id}", headers=admin_headers)
    assert download_res.status_code == 200, f"Report download failed: {download_res.text}"
    print(f"  [OK] Report PDF File Downloaded ({len(download_res.content)} bytes)")

    print("\n[STEP 7] Testing Executive Consoles for All 4 Roles:")
    role_consoles = [
        ("Researcher", "/executive/researcher", tokens["Researcher"]),
        ("Startup Founder", "/executive/startup", tokens["Startup Founder"]),
        ("Innovation Manager", "/executive/manager", tokens["Innovation Manager"]),
        ("Administrator", "/executive/admin", tokens["Administrator"]),
    ]

    for role_name, endpoint, tok in role_consoles:
        hdr = {"Authorization": f"Bearer {tok}"}
        res = client.get(endpoint, headers=hdr)
        assert res.status_code == 200, f"Executive console failed for {role_name}: {res.text}"
        print(f"  [OK] {role_name} Executive Console Loaded Cleanly (HTTP 200)")

    print("\n" + "=" * 80)
    print("   ALL SAMPLE LOGINS & USER INPUT TESTS COMPLETED WITH 100% SUCCESS!")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    run_sample_user_tests()
