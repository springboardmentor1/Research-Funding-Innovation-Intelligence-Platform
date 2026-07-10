import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.collector.storage import StorageCoordinator
from app.collector.openalex import OpenAlexCollector
from app.collector.orcid import ORCIDCollector
from app.collector.grants import GrantsGovCollector
from app.collector.patentsview import PatentsViewCollector
from app.models import Institution, Concept, Author, Publication, GrantOpportunity, Patent

# Setup test DB (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_storage_upsert_institution(db_session):
    storage = StorageCoordinator()
    
    # 1. Create a new institution
    inst1 = storage.upsert_institution(
        db=db_session,
        name="Test University",
        ror_id="https://ror.org/test1",
        openalex_id="https://openalex.org/I12345",
        country_code="US",
        type_="Education"
    )
    assert inst1.id is not None
    assert inst1.name == "Test University"

    # 2. Update the existing institution (matching on ROR ID)
    inst2 = storage.upsert_institution(
        db=db_session,
        name="Test University Revised",
        ror_id="https://ror.org/test1",
        country_code="CA"
    )
    assert inst2.id == inst1.id
    assert inst2.name == "Test University Revised"
    assert inst2.country_code == "CA"


def test_storage_upsert_concept(db_session):
    storage = StorageCoordinator()
    
    concept1 = storage.upsert_concept(
        db=db_session,
        openalex_id="https://openalex.org/C12345",
        display_name="Computer Science",
        level=1,
        description="Study of computing"
    )
    assert concept1.id is not None
    
    concept2 = storage.upsert_concept(
        db=db_session,
        openalex_id="https://openalex.org/C12345",
        display_name="Computing Science",
        level=1
    )
    assert concept2.id == concept1.id
    assert concept2.display_name == "Computing Science"


def test_orcid_mock_fallback(db_session):
    orcid_col = ORCIDCollector()
    results = orcid_col.search_researchers(db_session, "Chen", limit=2)
    
    # Check that it generated mock data and saved it to the DB
    assert len(results) == 2
    assert "orcid_id" in results[0]
    
    authors = db_session.query(Author).all()
    assert len(authors) > 0


def test_grants_mock_fallback(db_session):
    grants_col = GrantsGovCollector()
    results = grants_col.fetch_opportunities(db_session, "artificial intelligence", limit=1)
    
    assert len(results) >= 1
    assert "opportunity_id" in results[0]
    
    grants = db_session.query(GrantOpportunity).all()
    assert len(grants) > 0


def test_patentsview_mock_fallback(db_session):
    patents_col = PatentsViewCollector()
    results = patents_col.fetch_patents(db_session, "machine learning", limit=1)
    
    assert len(results) >= 1
    assert "patent_number" in results[0]
    
    patents = db_session.query(Patent).all()
    assert len(patents) > 0
