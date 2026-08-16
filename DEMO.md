# Demo Execution Guide — Milestones 1 to 4

This document provides a step-by-step guide to run the platform, verify role-based executive dashboards, generate and download multi-format reports, run automated test suites, and launch via Docker Compose.

---

## 1. Quick Start via Docker Compose (Recommended)

To run the entire platform microservice stack with a single command:

```bash
# 1. Clone Repository
git clone https://github.com/springboardmentor1/Research-Funding-Innovation-Intelligence-Platform.git
cd Research-Funding-Innovation-Intelligence-Platform

# 2. Build & Launch Containers
docker-compose up --build -d

# 3. Verify Running Services
docker-compose ps
```

- **Frontend Client**: `http://localhost:5173`
- **FastAPI Interactive Swagger Docs**: `http://localhost:8000/docs`

---

## 2. Local Manual Startup

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Activate Python virtual environment and install dependencies:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # Windows
   pip install -r requirements.txt
   ```
3. Launch backend API server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Launch Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 3. Step-by-Step Feature Demo Flow

### Step A: User Registration & Role Selection
1. Open `http://localhost:5173/register` (or Swagger UI `POST /auth/register`).
2. Register accounts with different roles:
   - **Administrator**: `admin@platform.org` (Role: `Administrator`)
   - **Innovation Manager**: `manager@tto.edu` (Role: `Innovation Manager`)
   - **Researcher**: `sarah.connor@cyberdyne.org` (Role: `Researcher`)
   - **Startup Founder**: `founder@cyberdyne.tech` (Role: `Startup Founder`)

### Step B: Explore Role-Based Executive Dashboards
Log in as each user to experience specialized role-tailored views:
1. **Admin Console** (`/admin/dashboard`): Operational health status, DB connection status, latency ms, active accounts chart, DB reindex tools.
2. **Innovation Manager Dashboard** (`/manager/dashboard`): Active licenses (24), total royalties ($1.45M), disclosure queue (9), TTO pipeline stages, departmental TRL breakdown.
3. **Researcher Dashboard** (`/researcher/dashboard`): Personal h-index (h-18), citation velocity, AI-matched grant opportunity calls with match % scores.
4. **Startup Founder Console** (`/startup/dashboard`): Technology Readiness Level (TRL 7/9), commercialization radar chart, competitor patent watch timeline.

### Step C: Generate & Download Executive Reports
1. Log in as Innovation Manager or Administrator and navigate to `/manager/reports`.
2. Select a Report Category (e.g., *Patent Landscape Analysis*).
3. Select an Output Format (*PDF*, *CSV*, or *JSON*).
4. Click **Generate & Download Report**.
5. Confirm that the browser triggers file download and that the file is persisted in `backend/reports/generated/`.

---

## 4. Run Automated Test Suites

### Backend Pytest Suite
```bash
cd backend
pytest
```

### Backend Full-Flow E2E Master Script
```bash
python backend/verify_milestone4_full_flow.py
```

### Frontend Vitest Suite
```bash
cd frontend
npm test
```
