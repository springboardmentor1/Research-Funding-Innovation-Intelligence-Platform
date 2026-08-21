# Developer Setup & Onboarding Guide

Welcome to the **Research Funding & Innovation Intelligence Platform** developer documentation! This guide provides end-to-end instructions for setting up your local environment, running the backend and frontend services, configuring environment variables, executing test suites, and troubleshooting common issues.

---

## 1. System Requirements

Before starting, ensure your local development machine has the following tools installed:

| Tool | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Python** | `v3.10+` | Backend FastAPI application framework |
| **Node.js** | `v18.0+` (LTS) | Frontend React & Vite build tooling |
| **npm** | `v9.0+` | JavaScript dependency management |
| **Docker & Docker Compose** | Engine `v20.10+`, Compose `v2.0+` | Containerized microservice orchestration |
| **Git** | `v2.30+` | Version control |

---

## 2. Repository Architecture Overview

```text
Research-Funding-Innovation-Intelligence-Platform/
├── backend/
│   ├── app/
│   │   ├── database/        # Database connection & ORM Session Local init
│   │   ├── models/          # SQLAlchemy Models (User, Profile, Publication, Patent, etc.)
│   │   ├── routes/          # API Routers (auth, profile, publication, patent, dashboard, reports)
│   │   ├── schemas/         # Pydantic Schemas for request/response validation
│   │   ├── services/        # Core business logic (matching engine, scoring, report generation)
│   │   └── main.py          # FastAPI application entry point & CORS configuration
│   ├── reports/
│   │   └── generated/       # Rendered executive PDF, CSV, and JSON reports storage
│   ├── tests/               # Backend Pytest unit & integration test suites
│   ├── verify_milestone4_full_flow.py # E2E platform master verification script
│   ├── Dockerfile           # Backend Python Docker container spec
│   └── requirements.txt     # Python package dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (charts, navigation, layout wrappers)
│   │   ├── pages/           # Executive & role-tailored dashboard views
│   │   ├── routes/          # React Router route definitions
│   │   └── tests/           # Vitest frontend unit test suite
│   ├── Dockerfile           # Multi-stage React/Nginx Docker container spec
│   ├── nginx.conf           # Production Nginx reverse proxy configuration
│   └── package.json         # Node.js dependencies & npm scripts
│
├── docs/                    # Technical specification & architecture documentation
├── docker-compose.yml       # Production multi-container composition file
├── README.md                # Project landing overview
└── DEMO.md                  # Step-by-step demonstration walkthrough guide
```

---

## 3. Environment Variables Configuration

Copy the example environment file in `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

### Environment Variables Breakdown

| Variable | Required | Default / Example Value | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | `postgresql://postgres:postgres@localhost:5432/research_platform` | Primary relational database connection string. Can be set to `sqlite:///./app.db` for zero-config local dev. |
| `MONGODB_URI` | Optional | `mongodb://localhost:27017/logs` | MongoDB connection string for document logging/auditing. |
| `JWT_SECRET_KEY` | Yes | `supersecretjwtkey_milestone4` | Secret key used to sign JSON Web Tokens (JWT). |
| `JWT_ALGORITHM` | Yes | `HS256` | Cryptographic algorithm for JWT generation. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Yes | `30` (or `60`) | Access token validity duration in minutes. |
| `OPENALEX_BASE_URL` | Yes | `https://api.openalex.org` | OpenAlex API base URL for publications data synchronization. |
| `OPENALEX_API_KEY` | Optional | `your_api_key_here` | Optional API key for OpenAlex polite pool high-rate access. |
| `LENS_API_KEY` | Optional | `your_lens_key_here` | API token for The Lens patent intelligence searches. |

---

## 4. Option 1: Quick Start via Docker Compose (Recommended)

Docker Compose provisions PostgreSQL, MongoDB, FastAPI Backend, and React Frontend in isolated, networked containers.

### Step 1: Build & Launch Container Stack
```bash
# From project root directory:
docker-compose build
docker-compose up -d
```

### Step 2: Verify Container Health
```bash
docker-compose ps
```
*Expected Output:*
- `platform_postgres` — Port `5432:5432` (healthy)
- `platform_mongodb` — Port `27017:27017` (running)
- `platform_backend` — Port `8000:8000` (running)
- `platform_frontend` — Port `5173:80` (running)

### Step 3: Stream Container Logs
```bash
docker-compose logs -f backend
```

### Access Endpoints
- **React Web Application**: `http://localhost:5173`
- **FastAPI Interactive Swagger Docs**: `http://localhost:8000/docs`
- **FastAPI ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 5. Option 2: Native Local Development (Manual Setup)

If you prefer to run services natively without Docker containers for active debugging:

### A. Backend Setup (`/backend`)

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate Python Virtual Environment**:
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Selection**:
   - *Option A (SQLite Fallback)*: Set `DATABASE_URL=sqlite:///./app.db` in `backend/.env`. Tables are created automatically on FastAPI startup via SQLAlchemy.
   - *Option B (PostgreSQL)*: Ensure PostgreSQL service is running locally on port `5432` and `DATABASE_URL` matches your local database user credentials.

5. **Start FastAPI Development Server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Verify Backend**:
   Open `http://localhost:8000` in your browser. You should receive:
   ```json
   {"message": "Research Funding & Innovation Intelligence Platform API is Running Successfully!"}
   ```

### B. Frontend Setup (`/frontend`)

1. **Open a new terminal and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js Package Dependencies**:
   ```bash
   npm install
   ```

3. **Launch Vite Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Browser**:
   Navigate to `http://localhost:5173` to interact with the application.

---

## 6. Master Data Simulator

To populate the database and refresh all frontend charts with rich multi-year variations (2018–2026 velocity trends across AI, Biotech, Quantum, Clean Energy, Robotics, and Medical Devices), run the consolidated single simulator script:

```bash
# Navigate to backend directory:
cd backend

# Execute continuous master simulator (adds data every 10 seconds until stopped by Ctrl+C):
python platform_simulator.py

# Run a single pass without continuous looping:
python platform_simulator.py --once
```

### Simulator CLI Modes

```bash
python platform_simulator.py              # Continuous 10-second live simulation loop
python platform_simulator.py --interval 5   # Custom interval (e.g. every 5 seconds)
python platform_simulator.py --once         # Single-pass execution
python platform_simulator.py --seed-db      # Seed database tables only
python platform_simulator.py --analytics    # Export JSON analytics datasets only
python platform_simulator.py --verify       # Run integrity verification check
```


---

## 7. User Roles & Test Accounts


The platform supports four specialized role-based executive views. You can register test users either via the web registration page (`http://localhost:5173/register`) or directly via Swagger UI (`POST /auth/register`).

| User Role | Example Email | Specialized Features |
| :--- | :--- | :--- |
| **Administrator** | `admin@platform.org` | System operational health, DB connection telemetry, audit logging, system reindexing tools. |
| **Innovation Manager** | `manager@tto.edu` | TTO licensing pipeline, active disclosure queue, royalty breakdown, multi-format report exports. |
| **Researcher** | `sarah.connor@cyberdyne.org` | Bibliometrics dashboard, h-index tracking, OpenAlex publications sync, AI grant matching engine. |
| **Startup Founder** | `founder@cyberdyne.tech` | Technology Readiness Level (TRL 1-9) radar, IP competitor watch timeline, patent growth velocity. |

---

## 7. Testing, Verification & Code Quality

### Backend Pytest Suite
Runs automated unit tests for authentication, executive dashboards, and report generation engines:
```bash
cd backend
pytest
```

### End-to-End Master Verification Script
Executes a complete full-flow validation across all 4 milestones (Authentication -> Research Profiles -> Publication Search -> Patent Analytics -> Grant Matching -> Executive Dashboards -> Report Exports):
```bash
python backend/verify_milestone4_full_flow.py
```

### Frontend Vitest Suite
Runs frontend component tests:
```bash
cd frontend
npm test
```

### Frontend Oxlint Code Quality Check
```bash
cd frontend
npm run lint
```

---

## 8. Common Troubleshooting & FAQs

### Q1: Database connection failure on backend startup (`psycopg2.OperationalError`)
- **Cause**: PostgreSQL is not running locally or credentials in `backend/.env` are incorrect.
- **Fix**: Either start PostgreSQL/Docker Compose or use SQLite fallback for quick local testing by editing `backend/.env`:
  ```env
  DATABASE_URL=sqlite:///./app.db
  ```

### Q2: Port binding error (`address already in use`)
- **Cause**: Port 5173, 8000, 5432, or 27017 is occupied by another process.
- **Fix**: Stop existing background services or identify process using port:
  - Windows: `netstat -ano | findstr :8000`
  - Linux/Mac: `lsof -i :8000`

### Q3: CORS errors on Frontend API requests
- **Cause**: Backend CORS middleware configuration mismatch.
- **Fix**: Ensure `app/main.py` includes `http://localhost:5173` in `allow_origins`.

### Q4: Generated PDF reports are not downloading or saved
- **Cause**: `backend/reports/generated/` directory missing or permission restricted.
- **Fix**: Ensure write permissions are granted. FastAPI automatically creates `backend/reports/generated/` if it does not exist.

---

## 9. Contact & Support

For questions, support, or security reports, please open an issue in the repository or contact the lead engineering maintainers.
