import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from main import app
from database.db import Base, get_db
from models.funding import FundingOpportunity

# In-memory SQLite for isolated integration testing
# StaticPool ensures all connections share the same in-memory database
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        # Seed test opportunities
        opp1 = FundingOpportunity(
            title="AI Quantum Convergence Grant",
            source="Government Grants",
            description="Deep learning and quantum computing research funding.",
            domain_tags=["Artificial Intelligence", "Quantum Computing"],
            deadline="2026-11-30",
            amount="$2,000,000",
        )
        opp2 = FundingOpportunity(
            title="Techstars DeepTech Accelerator",
            source="Startup Accelerators",
            description="Seed investment for robotics and autonomous industrial hardware.",
            domain_tags=["Robotics", "Industrial Automation"],
            deadline="2026-10-15",
            amount="$150,000",
        )
        db.add(opp1)
        db.add(opp2)
        db.commit()
        yield
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


def test_funding_recommendations_and_search():
    # 1. Register test user
    reg_response = client.post(
        "/api/auth/register",
        json={
            "email": "test.researcher@innovation.ai",
            "full_name": "Test Researcher",
            "password": "StrongPassword123!",
            "role": "Researcher",
        },
    )
    assert reg_response.status_code == 201, reg_response.text
    token = reg_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update researcher profile to have AI domains
    update_res = client.post(
        "/api/profile",
        json={
            "bio": "Researching quantum neural networks.",
            "research_domains": ["Artificial Intelligence", "Quantum Computing"],
            "keywords": ["quantum", "neural circuits"],
        },
        headers=headers,
    )
    assert update_res.status_code == 200

    # 3. Test GET /api/v1/funding/recommendations (requires JWT auth)
    unauth_res = client.get("/api/v1/funding/recommendations")
    assert unauth_res.status_code == 401

    rec_res = client.get("/api/v1/funding/recommendations", headers=headers)
    assert rec_res.status_code == 200, rec_res.text
    recommendations = rec_res.json()
    assert len(recommendations) == 2
    # Verify ranking: AI Quantum Convergence Grant should rank #1
    assert recommendations[0]["title"] == "AI Quantum Convergence Grant"
    assert "match_score" in recommendations[0]

    # 4. Test GET /api/v1/funding/search (basic filters)
    search_res = client.get("/api/v1/funding/search?source=Government+Grants")
    assert search_res.status_code == 200
    search_results = search_res.json()
    assert len(search_results) == 1
    assert search_results[0]["title"] == "AI Quantum Convergence Grant"

    search_domain_res = client.get("/api/v1/funding/search?domain=Robotics")
    assert search_domain_res.status_code == 200
    domain_results = search_domain_res.json()
    assert len(domain_results) == 1
    assert domain_results[0]["title"] == "Techstars DeepTech Accelerator"
