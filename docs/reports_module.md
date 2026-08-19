# Reports Engine Documentation (Milestone 4 — Step 3)

## Architecture & Storage Strategy
The Reports Engine provides automated generation and download of structured intelligence documents across multiple output formats (**PDF**, **CSV**, **JSON**).

### File Directory Layout
Generated report files are assigned unique identifiers (`REP-YYYYMMDD-UUID8`) and saved directly to dedicated disk storage:
```text
backend/
└── reports/
    ├── generated/    # Rendered PDF, CSV, and JSON output files
    └── templates/    # Header/Footer HTML layout templates
```

---

## API Endpoints

### 1. Retrieve Report Categories (`GET /reports/types`)
Returns supported report categories and output formats. Requires JWT authentication.

### 2. Generate Executive Report (`POST /reports/generate`)
Accepts JSON payload specifying report parameters:
```json
{
  "report_type": "patent_landscape",
  "format": "pdf",
  "domain": "Robotics & AI",
  "date_from": "2024-01-01",
  "date_to": "2026-08-16"
}
```

Response returns file metadata and unique `report_id`:
```json
{
  "report_id": "REP-20260816-7F8A1B9C",
  "filename": "REP-20260816-7F8A1B9C.pdf",
  "filepath": "c:\\Users\\Admin\\OneDrive\\Desktop\\ATM\\Research-Funding-Innovation-Intelligence-Platform\\backend\\reports\\generated\\REP-20260816-7F8A1B9C.pdf",
  "format": "pdf",
  "report_type": "patent_landscape",
  "generated_at": "2026-08-16 10:45:00",
  "size_bytes": 1845
}
```

### 3. Download Generated Report (`GET /reports/download/{report_id}`)
Streams the requested file from `backend/reports/generated/` to the browser or HTTP client.

### 4. List Report History (`GET /reports/list`)
Returns historical list of generated files available in storage.

---

## Verification
Run backend verification script:
```bash
python backend/verify_reports.py
```
