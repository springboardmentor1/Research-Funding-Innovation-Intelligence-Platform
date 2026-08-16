# Ingestion System Documentation

## Overview

This system ingests thousands of research papers (from OpenAlex) and patents (from The Lens) into a PostgreSQL database. It runs as background jobs triggered via admin HTTP endpoints or on a configurable schedule.

---

## 1. Required Environment Variables

Add these to your `.env` file (see `.env.example`):

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | – | PostgreSQL connection string |
| `OPENALEX_API_KEY` | Optional | – | OpenAlex premium API key (polite pool used without it) |
| `LENS_API_KEY` | ✅ for patents | – | The Lens API Bearer token |
| `INGESTION_BATCH_SIZE` | Optional | `100` | Records fetched per API call |
| `INGESTION_SCHEDULE_HOURS` | Optional | `24` | How often the scheduler runs (hours) |
| `SCHEDULED_MAX_RECORDS` | Optional | `5000` | Max records per scheduled run |
| `SCHEDULED_PUBLICATION_QUERY` | Optional | `artificial intelligence machine learning` | Search query for scheduled pub ingestion |
| `SCHEDULED_PATENT_QUERY` | Optional | `artificial intelligence` | Search query for scheduled patent ingestion |

---

## 2. How to Configure OpenAlex

OpenAlex is free and does not require an API key for the polite pool.

To use the polite pool (recommended): set the `User-Agent` header with your email (already done in `openalex_service.py`).

To use the premium pool: set `OPENALEX_API_KEY` in your `.env`.

OpenAlex API docs: https://docs.openalex.org

---

## 3. How to Configure The Lens

1. Register at https://www.lens.org
2. Generate an API token from your Lens account
3. Set `LENS_API_KEY=<your_token>` in `.env`

Lens API docs: https://docs.api.lens.org

---

## 4. How to Run the Ingestion Process

### Via Admin API (manual trigger)

```bash
# Trigger publication ingestion
curl -X POST http://localhost:8000/admin/ingestion/publications \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning", "max_records": 1000}'

# Trigger patent ingestion
curl -X POST http://localhost:8000/admin/ingestion/patents \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"query": "neural network", "max_records": 500}'
```

### Via Scheduler (automatic)

The scheduler starts automatically with the FastAPI server. It runs every `INGESTION_SCHEDULE_HOURS` hours. No manual intervention needed.

---

## 5. How to Monitor an Ingestion Job

```bash
# List all jobs
GET /admin/ingestion/jobs

# Get status of a specific job
GET /admin/ingestion/jobs/{job_id}
```

Response includes:
```json
{
  "id": "uuid",
  "source": "openalex",
  "entity_type": "publication",
  "status": "completed",
  "records_processed": 1000,
  "records_created": 850,
  "records_updated": 145,
  "records_failed": 5,
  "started_at": "2024-01-01T00:00:00",
  "completed_at": "2024-01-01T00:05:23"
}
```

---

## 6. How Scheduled Ingestion Works

```
FastAPI startup (lifespan)
        ↓
APScheduler starts
        ↓
Every INGESTION_SCHEDULE_HOURS hours:
        ↓
OpenAlex → fetch pages → normalize → upsert → global_publications
        ↓ (offset 30 min)
Lens    → fetch scroll → normalize → upsert → global_patents
```

Each scheduler job creates its own `DataIngestionJob` record for tracking.

---

## 7. How Deduplication Works

Every global publication and patent has a **unique constraint** on `(source, external_id)`:

- Publications: `source="openalex"`, `external_id=<OpenAlex work ID>`
- Patents: `source="lens"`, `external_id=<Lens ID>`

On each ingestion run:
1. Look up existing record by `(source, external_id)`
2. If found → **update** mutable fields (citation count, abstract, status)
3. If not found → **insert** new record
4. Track `records_created` vs `records_updated` in the job

Running the same query twice will **never create duplicates**.

---

## 8. Database Schema

### `data_ingestion_jobs`
Tracks every ingestion run.

| Column | Type | Description |
|---|---|---|
| `id` | String(36) PK | UUID |
| `source` | String(50) | `openalex` or `lens` |
| `entity_type` | String(50) | `publication` or `patent` |
| `status` | String(30) | `pending`, `running`, `completed`, `failed` |
| `query` | String(500) | Search query used |
| `records_processed` | Integer | Total records seen |
| `records_created` | Integer | New records inserted |
| `records_updated` | Integer | Existing records updated |
| `records_failed` | Integer | Records that failed normalisation |
| `last_cursor` | Text | For resuming interrupted jobs |
| `error_message` | Text | Set on failure |

### `global_publications`
Platform-wide publication index.

| Column | Type | Description |
|---|---|---|
| `id` | String(36) PK | Internal UUID |
| `external_id` | String(512) | OpenAlex work ID (indexed) |
| `source` | String(50) | `openalex` (indexed) |
| `doi` | String(512) | DOI (indexed) |
| `title` | Text | Publication title |
| `abstract` | Text | Full abstract |
| `authors` | JSON | List of author name strings |
| `journal` | String(512) | Journal/source name |
| `publication_date` | Date | Full date (indexed) |
| `publication_year` | Integer | Year only (indexed) |
| `citation_count` | Integer | Cited-by count |
| `open_access` | String(10) | `gold`, `green`, `closed`, etc. |
| `url` | Text | Landing page URL |
| `topics` | JSON | List of concept/topic strings |
| `raw_metadata` | JSON | Selected raw API fields |
| **Unique** | `(source, external_id)` | Dedup constraint |

### `global_patents`
Platform-wide patent index.

| Column | Type | Description |
|---|---|---|
| `id` | String(36) PK | Internal UUID |
| `external_id` | String(512) | Lens ID (indexed) |
| `source` | String(50) | `lens` (indexed) |
| `patent_number` | String(255) | Publication number (indexed) |
| `title` | Text | Patent title |
| `abstract` | Text | Patent abstract |
| `inventors` | JSON | List of inventor name strings |
| `assignee` | String(512) | Primary assignee (indexed) |
| `filing_date` | Date | Filing date (indexed) |
| `publication_date` | Date | Publication date (indexed) |
| `url` | Text | Lens URL |
| `classification` | Text | IPC/CPC codes |
| `status` | String(50) | `GRANTED`, `FILED`, etc. (indexed) |
| `jurisdiction` | String(10) | `US`, `EP`, etc. |
| `raw_metadata` | JSON | Selected raw API fields |
| **Unique** | `(source, external_id)` | Dedup constraint |

---

## 9. API Endpoints

### Admin Endpoints (Administrator role required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/admin/ingestion/publications` | Start background publication ingestion |
| `POST` | `/admin/ingestion/patents` | Start background patent ingestion |
| `GET` | `/admin/ingestion/jobs` | List all ingestion jobs |
| `GET` | `/admin/ingestion/jobs/{job_id}` | Get specific job status |

**POST body:**
```json
{
  "query": "machine learning neural network",
  "max_records": 1000
}
```

### Global Search Endpoints (Any authenticated user)

| Method | Path | Description |
|---|---|---|
| `GET` | `/global/publications` | Search global publication index |
| `GET` | `/global/publications/{id}` | Get single publication |
| `GET` | `/global/patents` | Search global patent index |
| `GET` | `/global/patents/{id}` | Get single patent |

**Publication filters:** `keyword`, `source`, `year_from`, `year_to`, `author`, `journal`, `min_citations`

**Patent filters:** `keyword`, `source`, `status`, `jurisdiction`, `assignee`, `inventor`, `year_from`, `year_to`

**Pagination:** `?page=1&limit=20` (max limit: 100)

---

## 10. How to Test Ingestion

```bash
# Run the full test suite (no real API calls, no PostgreSQL needed)
cd backend
.\venv\Scripts\python -m pytest tests/ -v

# Run a specific test file
.\venv\Scripts\python -m pytest tests/test_openalex_service.py -v
.\venv\Scripts\python -m pytest tests/test_ingestion_db.py -v
.\venv\Scripts\python -m pytest tests/test_admin_routes.py -v
```

Tests use **in-memory SQLite** — no external services required.

---

## 11. How to Troubleshoot API Failures

### OpenAlex failures

- Check `OPENALEX_API_KEY` is valid (or remove it to use polite pool)
- Monitor uvicorn logs for `[OpenAlex]` prefixed messages
- Check `data_ingestion_jobs` table: `status='failed'` + `error_message`
- OpenAlex rate limit: ~10 req/s for polite pool, higher for premium

### Lens failures

- Check `LENS_API_KEY` is set and valid (401 = bad key, 429 = rate limited)
- Monitor uvicorn logs for `[Lens]` prefixed messages
- Lens scroll API: scroll_id expires after 1 minute — reduce batch size if timeouts occur

### General

- All ingestion failures are **logged with job ID** — search uvicorn logs for the job ID
- Failed records are counted in `records_failed` — individual record failures don't stop the batch
- A crashed job sets `status='failed'` with `error_message` — safe to re-trigger

---

## Changed Files Summary

### New Files
| File | Purpose |
|---|---|
| `app/models/ingestion_job.py` | DataIngestionJob model |
| `app/models/global_publication.py` | GlobalPublication model |
| `app/models/global_patent.py` | GlobalPatent model |
| `app/services/openalex_service.py` | OpenAlex API client + normaliser |
| `app/services/lens_service.py` | Lens API client + normaliser |
| `app/services/ingestion_service.py` | Ingestion orchestrator |
| `app/routes/admin_ingestion.py` | Admin-only ingestion endpoints |
| `app/routes/global_search.py` | Global search endpoints |
| `app/scheduler.py` | APScheduler configuration |
| `tests/conftest.py` | Shared test fixtures |
| `tests/test_openalex_service.py` | OpenAlex service tests (13 tests) |
| `tests/test_lens_service.py` | Lens service tests (13 tests) |
| `tests/test_ingestion_db.py` | DB-level ingestion tests (16 tests) |
| `tests/test_admin_routes.py` | Admin API endpoint tests (8 tests) |
| `INGESTION_SYSTEM.md` | This file |

### Modified Files
| File | Change |
|---|---|
| `app/main.py` | Added lifespan, new model imports, new routers, structured logging |
| `requirements.txt` | Added apscheduler, pytest, pytest-mock, httpx |
| `.env.example` | Added ingestion configuration variables |
