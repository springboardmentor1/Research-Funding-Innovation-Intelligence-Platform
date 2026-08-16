"""
Database-level tests for ingestion service.
Tests insertion, update (upsert), deduplication, and rollback safety.
Uses in-memory SQLite via conftest fixtures.
"""
import pytest
from datetime import date

from app.services import ingestion_service
from app.models.global_publication import GlobalPublication
from app.models.global_patent import GlobalPatent
from app.models.ingestion_job import DataIngestionJob


# -----------------------------------------------------------------------
# Publication DB tests
# -----------------------------------------------------------------------

class TestPublicationDB:
    def _pub_item(self, external_id="openalex/W001"):
        return {
            "external_id": external_id,
            "source": "openalex",
            "doi": "10.1234/test",
            "title": "Test Publication Title",
            "abstract": "Test abstract.",
            "authors": ["Alice", "Bob"],
            "journal": "Test Journal",
            "publication_date": date(2024, 1, 1),
            "publication_year": 2024,
            "citation_count": 10,
            "open_access": "gold",
            "url": "https://example.com/paper",
            "topics": ["AI", "ML"],
            "raw_metadata": {"type": "article"},
        }

    def test_insert(self, db):
        job = ingestion_service.create_job(db, "openalex", "publication", "AI")
        ingestion_service._upsert_publications(db, job, [self._pub_item()])
        count = db.query(GlobalPublication).count()
        assert count == 1
        assert job.records_created == 1

    def test_deduplication(self, db):
        """Same (source, external_id) should not insert twice."""
        job = ingestion_service.create_job(db, "openalex", "publication", "AI")
        item = self._pub_item()
        ingestion_service._upsert_publications(db, job, [item])
        ingestion_service._upsert_publications(db, job, [item])   # second run
        count = db.query(GlobalPublication).count()
        assert count == 1
        assert job.records_created == 1
        assert job.records_updated == 1

    def test_update_citation_count(self, db):
        """Updated record should have new citation count."""
        job = ingestion_service.create_job(db, "openalex", "publication", "AI")
        item = self._pub_item()
        ingestion_service._upsert_publications(db, job, [item])

        # Same record, higher citation count
        updated = {**item, "citation_count": 999}
        ingestion_service._upsert_publications(db, job, [updated])

        pub = db.query(GlobalPublication).first()
        assert pub.citation_count == 999

    def test_multiple_inserts(self, db):
        job = ingestion_service.create_job(db, "openalex", "publication", "AI")
        batch = [self._pub_item(f"W{i:04d}") for i in range(10)]
        ingestion_service._upsert_publications(db, job, batch)
        assert db.query(GlobalPublication).count() == 10
        assert job.records_created == 10


# -----------------------------------------------------------------------
# Patent DB tests
# -----------------------------------------------------------------------

class TestPatentDB:
    def _pat_item(self, external_id="lens/001"):
        return {
            "external_id": external_id,
            "source": "lens",
            "patent_number": "US12345678A1",
            "title": "Test Patent Title",
            "abstract": "Test patent abstract.",
            "inventors": ["Alice Inventor"],
            "assignee": "Tech Corp",
            "filing_date": date(2023, 6, 1),
            "publication_date": date(2024, 1, 15),
            "url": "https://lens.org/patent/001",
            "classification": "G06F 40/30",
            "status": "GRANTED",
            "jurisdiction": "US",
            "raw_metadata": {"granted": True},
        }

    def test_insert(self, db):
        job = ingestion_service.create_job(db, "lens", "patent", "AI")
        ingestion_service._upsert_patents(db, job, [self._pat_item()])
        assert db.query(GlobalPatent).count() == 1
        assert job.records_created == 1

    def test_deduplication(self, db):
        job = ingestion_service.create_job(db, "lens", "patent", "AI")
        item = self._pat_item()
        ingestion_service._upsert_patents(db, job, [item])
        ingestion_service._upsert_patents(db, job, [item])
        assert db.query(GlobalPatent).count() == 1
        assert job.records_updated == 1

    def test_status_updated_on_upsert(self, db):
        job = ingestion_service.create_job(db, "lens", "patent", "AI")
        item = self._pat_item()
        ingestion_service._upsert_patents(db, job, [item])

        updated = {**item, "status": "EXPIRED"}
        ingestion_service._upsert_patents(db, job, [updated])
        pat = db.query(GlobalPatent).first()
        assert pat.status == "EXPIRED"


# -----------------------------------------------------------------------
# Job tracking tests
# -----------------------------------------------------------------------

class TestIngestionJobTracking:
    def test_create_job(self, db):
        job = ingestion_service.create_job(db, "openalex", "publication", "test query")
        assert job.id is not None
        assert job.status == "pending"
        assert job.records_created == 0

    def test_job_in_db(self, db):
        job = ingestion_service.create_job(db, "lens", "patent", "test")
        found = db.query(DataIngestionJob).filter(DataIngestionJob.id == job.id).first()
        assert found is not None
        assert found.source == "lens"

    def test_mark_running(self, db):
        job = ingestion_service.create_job(db, "openalex", "publication", "q")
        ingestion_service._mark_running(db, job)
        assert job.status == "running"
        assert job.started_at is not None

    def test_mark_done(self, db):
        job = ingestion_service.create_job(db, "openalex", "publication", "q")
        ingestion_service._mark_running(db, job)
        ingestion_service._mark_done(db, job)
        assert job.status == "completed"
        assert job.completed_at is not None

    def test_mark_failed(self, db):
        job = ingestion_service.create_job(db, "lens", "patent", "q")
        ingestion_service._mark_failed(db, job, "API is down")
        assert job.status == "failed"
        assert "API is down" in job.error_message


# -----------------------------------------------------------------------
# End-to-end ingestion with mocked iterators
# -----------------------------------------------------------------------

class TestRunIngestionE2E:
    def test_run_publication_ingestion(self, db, sample_openalex_work, mocker):
        """Full pipeline: iter → normalize → upsert → job tracking."""
        mocker.patch(
            "app.services.openalex_service.iter_works",
            return_value=iter([sample_openalex_work]),
        )
        job = ingestion_service.run_publication_ingestion(db, "AI", max_records=10)
        assert job.status == "completed"
        assert job.records_created == 1
        assert db.query(GlobalPublication).count() == 1

    def test_run_patent_ingestion(self, db, sample_lens_patent, mocker):
        mocker.patch(
            "app.services.lens_service.iter_patents",
            return_value=iter([sample_lens_patent]),
        )
        job = ingestion_service.run_patent_ingestion(db, "AI", max_records=10)
        assert job.status == "completed"
        assert job.records_created == 1
        assert db.query(GlobalPatent).count() == 1

    def test_no_duplicates_across_two_runs(self, db, sample_openalex_work, mocker):
        mocker.patch(
            "app.services.openalex_service.iter_works",
            return_value=iter([sample_openalex_work]),
        )
        ingestion_service.run_publication_ingestion(db, "AI", max_records=10)

        mocker.patch(
            "app.services.openalex_service.iter_works",
            return_value=iter([sample_openalex_work]),
        )
        ingestion_service.run_publication_ingestion(db, "AI", max_records=10)

        assert db.query(GlobalPublication).count() == 1   # dedup worked
