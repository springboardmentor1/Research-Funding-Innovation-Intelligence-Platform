import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone, timedelta
from main import app
from database.db import get_db, SessionLocal
from models.funding import FundingOpportunity, GrantTracking
from models.profile import ResearchProfile
from models.user import User
from utils.security import get_password_hash

client = TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    # Use the real database (Neon) but roll back after tests
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def transaction_session(db_session):
    # Start a transaction
    db_session.begin_nested()
    
    # Yield the session
    yield db_session
    
    # Roll back after the test
    db_session.rollback()

def override_get_db_transaction(transaction_session):
    def _override():
        # Mock commit to just flush, so routes calling db.commit() don't break the transaction
        original_commit = transaction_session.commit
        transaction_session.commit = transaction_session.flush
        try:
            yield transaction_session
        finally:
            transaction_session.commit = original_commit
    return _override

@pytest.fixture
def auth_client(transaction_session):
    app.dependency_overrides[get_db] = override_get_db_transaction(transaction_session)
    
    # Create test user
    user = transaction_session.query(User).filter(User.email == "test.grant2@innovation.ai").first()
    if not user:
        user = User(
            email="test.grant2@innovation.ai",
            full_name="Grant Test User",
            hashed_password=get_password_hash("password123"),
            role="Researcher"
        )
        transaction_session.add(user)
        transaction_session.flush()
        
        profile = ResearchProfile(
            user_id=user.id,
            career_stage="postdoc",
            institution_type="university",
            region="us"
        )
        transaction_session.add(profile)
        transaction_session.flush()
    
    # Login
    response = client.post(
        "/api/auth/login",
        json={"email": "test.grant2@innovation.ai", "password": "password123"}
    )
    if response.status_code != 200:
        raise Exception(f"Login failed: {response.text}")
    token = response.json()["access_token"]
    
    yield TestClient(app, headers={"Authorization": f"Bearer {token}"}), user.id
    
    app.dependency_overrides.pop(get_db, None)


def test_hard_filter_logic(transaction_session):
    from services.funding_matcher import evaluate_eligibility
    
    # Pass profile
    pass_profile = ResearchProfile(career_stage="postdoc", institution_type="university", region="us")
    fail_profile = ResearchProfile(career_stage="student", institution_type="enterprise", region="uk")
    
    opp = FundingOpportunity(
        title="Test Opp",
        source="Test Source",
        description="Test Desc",
        min_career_stage="postdoc",
        institution_type="university",
        region="us",
        deadline_date=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=10)
    )
    
    # Test pass
    passes = evaluate_eligibility(opp, pass_profile)
    assert all(passes.values())
    
    # Test fail
    fails = evaluate_eligibility(opp, fail_profile)
    assert not all(fails.values())
    assert not fails["career_stage"]
    assert not fails["institution_type"]
    assert not fails["region"]


def test_grant_tracking_endpoints(auth_client, transaction_session):
    client, user_id = auth_client
    
    # Create passing and failing opportunities
    opp_pass = FundingOpportunity(
        title="Eligible Opp",
        source="Source",
        description="Desc",
        min_career_stage="postdoc",
        institution_type="university",
        region="us",
        deadline_date=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=30)
    )
    opp_fail = FundingOpportunity(
        title="Ineligible Opp",
        source="Source",
        description="Desc",
        min_career_stage="faculty",
        institution_type="university",
        region="us",
        deadline_date=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=30)
    )
    transaction_session.add(opp_pass)
    transaction_session.add(opp_fail)
    transaction_session.flush()
    
    # GET /eligible
    res = client.get("/api/v1/funding/eligible?limit=1000")
    assert res.status_code == 200
    eligible = res.json()
    titles = [e["title"] for e in eligible]
    assert "Eligible Opp" in titles
    assert "Ineligible Opp" not in titles
    
    # POST /track
    res_track = client.post(f"/api/v1/funding/{opp_pass.id}/track", json={"status": "interested", "notes": "Looks good"})
    assert res_track.status_code == 200
    track_data = res_track.json()
    assert track_data["status"] == "interested"
    assert track_data["notes"] == "Looks good"
    assert track_data["funding_opportunity_id"] == opp_pass.id
    track_id = track_data["id"]
    
    # GET /tracked
    res_get_track = client.get("/api/v1/funding/tracked")
    assert res_get_track.status_code == 200
    tracked_list = res_get_track.json()
    assert len([t for t in tracked_list if t["id"] == track_id]) == 1
    
    # PATCH /tracked/{id}
    res_patch = client.patch(f"/api/v1/funding/tracked/{track_id}", json={"status": "applied"})
    assert res_patch.status_code == 200
    assert res_patch.json()["status"] == "applied"
