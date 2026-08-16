"""
Shared pytest fixtures for the ingestion system tests.
Uses an in-memory SQLite DB — no PostgreSQL required to run tests.
"""
import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base
# Import all models so their tables are created
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent
from app.models.report import Report
from app.models.ingestion_job import DataIngestionJob
from app.models.global_publication import GlobalPublication
from app.models.global_patent import GlobalPatent


SQLITE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def db():
    """Provide a fresh in-memory SQLite session for each test."""
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def sample_openalex_work():
    """Minimal valid OpenAlex work dict."""
    return {
        "id": "https://openalex.org/W1234567890",
        "title": "Deep Learning for Natural Language Processing",
        "display_name": "Deep Learning for Natural Language Processing",
        "doi": "https://doi.org/10.1234/test.2024.001",
        "abstract_inverted_index": {
            "This": [0], "paper": [1], "presents": [2], "a": [3],
            "novel": [4], "approach": [5],
        },
        "authorships": [
            {"author": {"display_name": "Jane Doe"}},
            {"author": {"display_name": "John Smith"}},
        ],
        "primary_location": {
            "source": {"display_name": "Nature Machine Intelligence"},
            "landing_page_url": "https://www.nature.com/articles/test",
        },
        "publication_date": "2024-03-15",
        "publication_year": 2024,
        "cited_by_count": 42,
        "open_access": {"is_oa": True, "oa_status": "gold"},
        "concepts": [
            {"display_name": "Artificial Intelligence"},
            {"display_name": "Machine Learning"},
        ],
        "topics": [],
        "type": "article",
    }


@pytest.fixture()
def sample_lens_patent():
    """Minimal valid Lens patent dict."""
    return {
        "lens_id": "000-000-000-000-001",
        "title": [{"text": "System and Method for AI-Based Data Processing", "lang": "en"}],
        "abstract": [{"text": "An invention relating to AI data processing systems.", "lang": "en"}],
        "inventors": [{"display_name": "Alice Inventor"}, {"display_name": "Bob Co-Inventor"}],
        "assignees": [{"display_name": "Tech Corp Inc"}],
        "filing_date": "2023-06-01",
        "publication_date": "2024-01-15",
        "publication_number": "US20240001234A1",
        "classifications_ipcr": [{"symbol": "G06F 40/30"}, {"symbol": "G06N 3/08"}],
        "granted": True,
        "jurisdiction": "US",
        "cited_by_patent_count": 5,
        "family_id": "FAM123456",
    }
