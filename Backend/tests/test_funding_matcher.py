import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.db import Base
from models.funding import FundingOpportunity
from models.profile import ResearchProfile
from services.funding_matcher import match_funding_opportunities


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_matching_ranking_order(db_session):
    # Create mock opportunities
    ai_grant = FundingOpportunity(
        title="NSF Foundational Artificial Intelligence Grant",
        source="Government Grants",
        description="Grants for large language models, deep neural networks, and reinforcement learning research architectures.",
        domain_tags=[
            "Artificial Intelligence",
            "Large Language Models",
            "Deep Learning",
        ],
        amount="$1,000,000",
    )
    bio_grant = FundingOpportunity(
        title="Marine Biology & Oceanography Expedition Grant",
        source="Research Councils",
        description="Funding for studying deep sea coral reefs, ocean salinity levels, and marine ecosystem conservation.",
        domain_tags=["Marine Biology", "Oceanography", "Ecology"],
        amount="$500,000",
    )
    db_session.add(ai_grant)
    db_session.add(bio_grant)
    db_session.commit()

    # Create mock AI researcher profile
    ai_profile = ResearchProfile(
        user_id=1,
        bio="Lead researcher focusing on LLM alignment, transformers, and neural architectures.",
        organization="Stanford AI Lab",
        research_domains=["Artificial Intelligence", "Natural Language Processing"],
        keywords=["transformers", "deep learning", "LLMs"],
    )

    # Run matcher
    matches = match_funding_opportunities(db_session, ai_profile, limit=10)

    assert len(matches) == 2
    # Verify ranking order makes sense (AI grant must rank 1st with higher similarity score)
    assert matches[0].title == ai_grant.title
    assert matches[1].title == bio_grant.title
    assert matches[0].match_score > matches[1].match_score
