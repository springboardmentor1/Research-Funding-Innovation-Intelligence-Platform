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
    from app.database.connection import engine, Base, SessionLocal
    from app.models.profile import ResearchProfile
    from app.models.user import User
    from app.services.funding_service import (
        extract_profile_features,
        load_funding_dataset,
        filter_by_eligibility,
        calculate_match_score,
        rank_funding_opportunities,
        get_top_recommendations,
        match_researcher_to_funding
    )
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

# Initialize SQLite database schema
Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("\n=============================================")
# Grant matching workflow verification script
print("GRANT MATCHING WORKFLOW INTEGRATION TESTS")
print("=============================================\n")

checklist = {
    "1. Feature Extraction": False,
    "2. Dataset Ingestion (Source-Agnostic)": False,
    "3. Hard Constraints Eligibility Filtering": False,
    "4. Placeholder Score Computation": False,
    "5. Ranking & Top Recommendation Selection": False,
    "6. Full End-to-End Matching Pipeline Run": False
}

try:
    # ----------------------------------------------------
    # Setup: Create Test User & Research Profile
    # ----------------------------------------------------
    print("[SETUP] Setting up test database records...")
    
    test_user = User(
        full_name="Dr. Alice Scholar",
        email="alice.scholar@university.edu",
        hashed_password="securepassword123",
        role="Researcher"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

    # Inferred country from organization ("MIT CSAIL Labs") should be "US" (default/inferred)
    test_profile = ResearchProfile(
        user_id=test_user.id,
        research_domain="Artificial Intelligence",
        research_subdomain="Machine Learning",
        keywords="artificial intelligence, neural networks, machine learning, deep learning",
        organization="MIT CSAIL Labs",
        designation="Postdoctoral Researcher",
        highest_qualification="Ph.D. in Computer Science",
        years_of_experience=4,
        research_interests="deep learning, robotics, cognitive agents",
        publications_count=12,
        patents_count=2,
        biography="Researching scalable and robust neural network models."
    )
    db.add(test_profile)
    db.commit()
    db.refresh(test_profile)
    print("[SETUP] Setup complete.\n")

    # ----------------------------------------------------
    # Check 1: Feature Extraction
    # ----------------------------------------------------
    features = extract_profile_features(test_profile)
    
    assert features["research_domain"] == "Artificial Intelligence"
    assert "neural networks" in features["keywords"]
    assert features["publications_count"] == 12
    assert features["patents_count"] == 2
    assert features["years_of_experience"] == 4
    assert features["country"] == "US"
    
    checklist["1. Feature Extraction"] = True
    print("[OK] 1. Feature Extraction: SUCCESS (Researcher features parsed correctly)")

    # ----------------------------------------------------
    # Check 2: Dataset Ingestion (Source-Agnostic)
    # ----------------------------------------------------
    # Test loading from database fallback (CSV)
    opportunities = load_funding_dataset(db, source="database")
    assert len(opportunities) > 0, "Ingestion returned zero opportunities"
    
    # Assert expected columns are in raw dictionaries
    sample_opp = opportunities[0]
    expected_keys = ["funding_id", "funding_title", "funding_agency", "research_domain", "keywords", "country", "status"]
    for key in expected_keys:
        assert key in sample_opp, f"Required key '{key}' missing from opportunity dictionary"
        
    checklist["2. Dataset Ingestion (Source-Agnostic)"] = True
    print(f"[OK] 2. Dataset Ingestion: SUCCESS (Fetched {len(opportunities)} records from source)")

    # ----------------------------------------------------
    # Check 3: Hard Constraints Eligibility Filtering
    # ----------------------------------------------------
    # Setup explicit mock opportunities to test filter boundaries
    mock_opps = [
        {"funding_id": "OP-01", "status": "OPEN", "country": "US", "research_domain": "Artificial Intelligence"},
        {"funding_id": "OP-02", "status": "CLOSED", "country": "US", "research_domain": "Artificial Intelligence"}, # Excluded (CLOSED)
        {"funding_id": "OP-03", "status": "OPEN", "country": "EU", "research_domain": "Artificial Intelligence"}, # Excluded (Country mismatch)
        {"funding_id": "OP-04", "status": "OPEN", "country": "Global", "research_domain": "Biotechnology"}, # Kept (Global)
    ]
    
    filtered_opps = filter_by_eligibility(mock_opps, features)
    filtered_ids = [o["funding_id"] for o in filtered_opps]
    
    assert "OP-01" in filtered_ids, "OP-01 should be kept (matching country, OPEN)"
    assert "OP-02" not in filtered_ids, "OP-02 should be filtered out (CLOSED)"
    assert "OP-03" not in filtered_ids, "OP-03 should be filtered out (EU vs researcher US)"
    assert "OP-04" in filtered_ids, "OP-04 should be kept (Global country status)"
    
    checklist["3. Hard Constraints Eligibility Filtering"] = True
    print("[OK] 3. Eligibility Filtering: SUCCESS (Status and geographic filters operate correctly)")

    # ----------------------------------------------------
    # Check 4: Placeholder Score Computation
    # ----------------------------------------------------
    opp_to_score = {
        "funding_id": "OP-01",
        "funding_title": "Adaptive AI Systems call",
        "research_domain": "Artificial Intelligence",
        "keywords": "neural networks, deep learning, optimization",
        "country": "US"
    }
    
    # Overlapping keywords: "neural networks" and "deep learning" (2 matches)
    # Expected placeholder score: 2 * 0.1 = 0.2
    scored_opp = calculate_match_score(opp_to_score, features)
    
    assert "match_score" in scored_opp
    assert "match_explanation" in scored_opp
    assert scored_opp["match_score"] == 0.2
    assert "[Placeholder Score]" in scored_opp["match_explanation"]
    
    checklist["4. Placeholder Score Computation"] = True
    print("[OK] 4. Placeholder Score: SUCCESS (Simple keyword count calculated correctly)")

    # ----------------------------------------------------
    # Check 5: Ranking & Top Recommendation Selection
    # ----------------------------------------------------
    scored_list = [
        {"funding_id": "A", "match_score": 0.1},
        {"funding_id": "B", "match_score": 0.5},
        {"funding_id": "C", "match_score": 0.3},
        {"funding_id": "D", "match_score": 0.8},
        {"funding_id": "E", "match_score": 0.4},
        {"funding_id": "F", "match_score": 0.2}
    ]
    
    ranked = rank_funding_opportunities(scored_list)
    assert ranked[0]["funding_id"] == "D"
    assert ranked[-1]["funding_id"] == "A"
    
    top_recs = get_top_recommendations(ranked, limit=3)
    assert len(top_recs) == 3
    assert [o["funding_id"] for o in top_recs] == ["D", "B", "E"]
    
    checklist["5. Ranking & Top Recommendation Selection"] = True
    print("[OK] 5. Ranking & Top Selection: SUCCESS (Correctly sorted and sliced results)")

    # ----------------------------------------------------
    # Check 6: Full End-to-End Matching Pipeline Run
    # ----------------------------------------------------
    recommendations = match_researcher_to_funding(db, test_user.id)
    
    assert len(recommendations) <= 5
    # Ensure scores are sorted descending
    for i in range(len(recommendations) - 1):
        assert recommendations[i]["match_score"] >= recommendations[i+1]["match_score"]
        
    checklist["6. Full End-to-End Matching Pipeline Run"] = True
    print(f"[OK] 6. End-to-End Run: SUCCESS (Successfully returned {len(recommendations)} recommendations for Alice)")

except Exception as e:
    print(f"\n[ERROR] Verification failed with exception: {e}")
    import traceback
    traceback.print_exc()

# ----------------------------------------------------
# Cleanup & Report
# ----------------------------------------------------
db.close()
if os.path.exists("verify_test.db"):
    try:
        os.remove("verify_test.db")
    except Exception:
        pass

print("\n=============================================")
print("VERIFICATION CHECKLIST SUMMARY")
print("=============================================")
all_passed = True
for check, status in checklist.items():
    status_str = "PASSED" if status else "FAILED"
    print(f"{check:40} : {status_str}")
    if not status:
        all_passed = False

if all_passed:
    print("\nSUCCESS: All grant matching workflow tests passed successfully!")
    sys.exit(0)
else:
    print("\nFAILURE: Some matching checks failed. Check error trace above.")
    sys.exit(1)
