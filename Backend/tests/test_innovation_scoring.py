import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.db import Base
from models.user import User
from models.profile import ResearchProfile
from models.intelligence import InnovationScore
from services.innovation_service import calculate_score

# Setup an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_innovation_score_calculation(db):
    # Setup test user and profile
    user = User(email="test@example.com", full_name="Test User", hashed_password="hashed")
    db.add(user)
    db.commit()
    
    profile = ResearchProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    # Calculate score
    score = calculate_score(db, profile.id)

    # Verify score normalization and weights
    # Weighted calculation per service:
    # 75 * 0.30 = 22.5
    # 60 * 0.20 = 12.0
    # 80 * 0.15 = 12.0
    # 70 * 0.20 = 14.0
    # 85 * 0.15 = 12.75
    # Total = 73.25
    expected_composite = (75.0 * 0.30) + (60.0 * 0.20) + (80.0 * 0.15) + (70.0 * 0.20) + (85.0 * 0.15)
    
    assert score.composite_score == expected_composite
    assert score.research_novelty_score == 75.0
    assert score.patent_strength_score == 60.0
    assert score.technology_maturity_score == 80.0
    assert score.market_potential_score == 70.0
    assert score.funding_relevance_score == 85.0
