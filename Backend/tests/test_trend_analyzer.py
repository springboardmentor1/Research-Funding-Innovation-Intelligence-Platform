import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.db import Base
from models.research_data import Publication
from services.trend_analyzer import publication_count_by_domain_year, emerging_keywords, research_hotspots

# Use in-memory SQLite for testing
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

def test_publication_count_by_domain_year(db):
    pubs = [
        Publication(openalex_id="W1", title="T1", authors="A", domain="AI", year=2026, keywords=["A"]),
        Publication(openalex_id="W2", title="T2", authors="A", domain="AI", year=2026, keywords=["A"]),
        Publication(openalex_id="W3", title="T3", authors="A", domain="AI", year=2025, keywords=["A"]),
        Publication(openalex_id="W4", title="T4", authors="A", domain="Bio", year=2026, keywords=["A"]),
    ]
    db.add_all(pubs)
    db.commit()
    
    res = publication_count_by_domain_year(db)
    assert len(res) == 3
    ai_2026 = next(r for r in res if r["domain"] == "AI" and r["year"] == 2026)
    assert ai_2026["count"] == 2

def test_emerging_keywords(db):
    # Year 2026: LLM (2), NLP (1)
    # Year 2025: LLM (1), NLP (1)
    # Year 2024: NLP (1)
    pubs = [
        Publication(openalex_id="W1", title="T1", authors="A", domain="AI", year=2026, keywords=["LLM", "NLP"]),
        Publication(openalex_id="W2", title="T2", authors="A", domain="AI", year=2026, keywords=["LLM"]),
        Publication(openalex_id="W3", title="T3", authors="A", domain="AI", year=2025, keywords=["LLM", "NLP"]),
        Publication(openalex_id="W4", title="T4", authors="A", domain="AI", year=2024, keywords=["NLP"]),
    ]
    db.add_all(pubs)
    db.commit()
    
    res = emerging_keywords(db)
    assert len(res) == 2
    llm = next(r for r in res if r["keyword"] == "LLM")
    nlp = next(r for r in res if r["keyword"] == "NLP")
    
    assert llm["growth_score"] == 1 # 2 - 1
    assert nlp["growth_score"] == -1 # 1 - 2
    assert res[0]["keyword"] == "LLM" # LLM should be first due to higher growth score

def test_research_hotspots(db):
    pubs = [
        # AI: 2026=2, 2025=1 (+100%)
        Publication(openalex_id="W1", title="T1", authors="A", domain="AI", year=2026, keywords=[]),
        Publication(openalex_id="W2", title="T2", authors="A", domain="AI", year=2026, keywords=[]),
        Publication(openalex_id="W3", title="T3", authors="A", domain="AI", year=2025, keywords=[]),
        # Bio: 2026=1, 2025=2 (-50%)
        Publication(openalex_id="W4", title="T4", authors="A", domain="Bio", year=2026, keywords=[]),
        Publication(openalex_id="W5", title="T5", authors="A", domain="Bio", year=2025, keywords=[]),
        Publication(openalex_id="W6", title="T6", authors="A", domain="Bio", year=2025, keywords=[]),
    ]
    db.add_all(pubs)
    db.commit()
    
    res = research_hotspots(db)
    assert len(res) == 2
    
    ai = next(r for r in res if r["domain"] == "AI")
    bio = next(r for r in res if r["domain"] == "Bio")
    
    assert ai["growth_percent"] == 100.0
    assert bio["growth_percent"] == -50.0
    assert res[0]["domain"] == "AI"
