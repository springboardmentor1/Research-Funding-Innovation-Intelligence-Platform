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
    from app.database.connection import engine, Base, SessionLocal
    from app.models.profile import ResearchProfile
    from app.models.user import User
    from app.services import funding_service
    from app.models.funding import FundingOpportunity
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

# Initialize database schema
Base.metadata.create_all(bind=engine)
db = SessionLocal()
client = TestClient(app)

checklist = {
    "Research Profile Loaded": False,
    "Features Extracted": False,
    "Funding Dataset Loaded": False,
    "Eligibility Filtering Passed": False,
    "Match Scores Generated": False,
    "Ranking Correct": False,
    "Recommendation Reasons Present": False,
    "API Response Valid": False,
    "JWT Authentication Passed": False
}

try:
    # 1. Seed test database with User & Profile by calling register API first
    user_payload = {
        "full_name": "Dr. Alice Recommendation",
        "email": "alice.rec@example.com",
        "password": "recpassword123",
        "role": "Researcher"
    }

    # Register via API to hash password correctly
    reg_response = client.post("/auth/register", json=user_payload)
    assert reg_response.status_code == 201, f"User registration failed: {reg_response.text}"

    # Fetch created user to get ID
    test_user = db.query(User).filter(User.email == user_payload["email"]).first()
    assert test_user is not None, "Registered user not found in database"

    test_profile = ResearchProfile(
        user_id=test_user.id,
        research_domain="Artificial Intelligence",
        research_subdomain="Machine Learning",
        keywords="artificial intelligence, neural networks, machine learning, deep learning",
        organization="MIT CSAIL Labs",
        designation="Postdoctoral Researcher",
        years_of_experience=4,
        research_interests="deep learning, robotics, cognitive agents",
        publications_count=12,
        patents_count=2,
        biography="Researching scalable and robust neural network models."
    )
    db.add(test_profile)
    db.commit()
    db.refresh(test_profile)

    # Seed mock funding opportunity
    test_funding = FundingOpportunity(
        funding_id="US-DOE-12345",
        title="AI Research Grant",
        funding_agency="Department of Energy",
        research_domain="Artificial Intelligence",
        funding_amount=1000000.0,
        currency="USD",
        funding_type="Grant",
        country="US",
        status="OPEN",
        source_url="https://example.gov/grant/123",
        verified=True,
        keywords="artificial intelligence, neural networks, machine learning"
    )
    db.add(test_funding)
    db.commit()

    # Verify Service components
    # A. Profile check
    profile_loaded = db.query(ResearchProfile).filter(ResearchProfile.user_id == test_user.id).first()
    if profile_loaded:
        checklist["Research Profile Loaded"] = True

    # B. Feature extraction
    features = funding_service.extract_profile_features(profile_loaded)
    if isinstance(features, dict) and features.get("research_domain", "").lower() == "artificial intelligence":
        checklist["Features Extracted"] = True

    # C. Ingest dataset
    dataset = funding_service.load_funding_dataset(db, source="database")
    if len(dataset) > 0:
        checklist["Funding Dataset Loaded"] = True

    # D. Eligibility
    eligible = funding_service.filter_by_eligibility(dataset, features)
    if len(eligible) > 0:
        checklist["Eligibility Filtering Passed"] = True

    # E. Get direct recommendations to inspect score calculation & ranking
    recs = funding_service.get_personalized_recommendations(
        db=db,
        user_id=test_user.id,
        limit=10
    )

    if len(recs) > 0:
        # Check scores generated
        if any(r.get("match_score", 0.0) > 0 for r in recs):
            checklist["Match Scores Generated"] = True

        # Check ranking descending
        is_sorted = all(recs[i]["match_score"] >= recs[i+1]["match_score"] for i in range(len(recs)-1))
        if is_sorted:
            checklist["Ranking Correct"] = True

        # Check dynamic recommendation explanation
        sample_reason = recs[0].get("recommendation_reason", "")
        if "Matched because:" in sample_reason and "• Research Domain:" in sample_reason and "• Keyword Match:" in sample_reason:
            checklist["Recommendation Reasons Present"] = True

    # F. Verify Router Endpoint Protection and Response Format
    # Login user via API to retrieve valid JWT
    login_response = client.post("/auth/login", data={
        "username": user_payload["email"],
        "password": user_payload["password"]
    })
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    token = login_response.json().get("access_token")

    if token:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 1: Unauthenticated endpoint request
        unauth_res = client.get("/funding/recommendations")
        if unauth_res.status_code == 401:
            checklist["JWT Authentication Passed"] = True

        # Test 2: Authenticated endpoint request
        auth_res = client.get("/funding/recommendations", headers=headers)
        if auth_res.status_code == 200:
            res_json = auth_res.json()
            if "recommendations" in res_json and isinstance(res_json["recommendations"], list):
                # Verify that filters work
                filt_res = client.get("/funding/recommendations?limit=3&minimum_match_score=0", headers=headers)
                if filt_res.status_code == 200 and len(filt_res.json()["recommendations"]) <= 3:
                    checklist["API Response Valid"] = True

except Exception as e:
    print(f"Verification encountered error: {e}")
    import traceback
    traceback.print_exc()

# Output verification results in exact requested format
print("=============================================")
print("FUNDING OPPORTUNITY RECOMMENDATIONS")
print("=============================================")

print(f"[OK] Research Profile Loaded" if checklist["Research Profile Loaded"] else "[FAIL] Research Profile Loaded")
print(f"[OK] Features Extracted" if checklist["Features Extracted"] else "[FAIL] Features Extracted")
print(f"[OK] Funding Dataset Loaded" if checklist["Funding Dataset Loaded"] else "[FAIL] Funding Dataset Loaded")
print(f"[OK] Eligibility Filtering Passed" if checklist["Eligibility Filtering Passed"] else "[FAIL] Eligibility Filtering Passed")
print(f"[OK] Match Scores Generated" if checklist["Match Scores Generated"] else "[FAIL] Match Scores Generated")
print(f"[OK] Ranking Correct" if checklist["Ranking Correct"] else "[FAIL] Ranking Correct")
print(f"[OK] Recommendation Reasons Present" if checklist["Recommendation Reasons Present"] else "[FAIL] Recommendation Reasons Present")
print(f"[OK] API Response Valid" if checklist["API Response Valid"] else "[FAIL] API Response Valid")
print(f"[OK] JWT Authentication Passed" if checklist["JWT Authentication Passed"] else "[FAIL] JWT Authentication Passed")

print("=============================================")
if all(checklist.values()):
    print("Verification completed successfully.")
    exit_code = 0
else:
    print("Verification failed.")
    exit_code = 1

# Cleanup database
db.close()
if os.path.exists("verify_test.db"):
    try:
        os.remove("verify_test.db")
    except Exception:
        pass

sys.exit(exit_code)
