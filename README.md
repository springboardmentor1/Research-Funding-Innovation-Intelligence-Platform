# Research Funding & Innovation Intelligence Platform

A comprehensive full-stack platform connecting researchers with funding opportunities, research papers (via OpenAlex), patent data, and innovation intelligence.

**Version 4.0** — Milestone 4: Executive Dashboard, Reports & Export, Full Testing, Docker Deployment

---

## Architecture

```
Frontend (React + Vite)          Backend (FastAPI + Python)
┌──────────────────────┐        ┌──────────────────────────┐
│  React 19 + Recharts │  HTTP  │  FastAPI 0.111+          │
│  Lucide Icons        │◄──────►│  SQLAlchemy + SQLite     │
│  React Router 7      │        │  Pandas (analytics)      │
│  Axios HTTP Client   │        │  ReportLab (PDF export)  │
│  Dark/Light Theme    │        │  OpenPyXL (Excel export) │
└──────────────────────┘        └──────────────────────────┘
        Port 5173                        Port 8000
```

---

## Features

### Core (Milestone 1)
- User registration & login with JWT authentication
- Research profile management
- Research paper search via OpenAlex API
- Funding opportunity search & filtering
- Patent search & filtering

### Intelligence (Milestone 2)
- AI-powered funding recommendations (Jaccard + multi-criteria matching)
- Publication trend analysis with year-over-year growth
- Research intelligence dashboard
- Funding analytics by area & agency

### Innovation (Milestone 3)
- Patent landscape analysis (by technology, country, year, assignee)
- Technology intelligence with growth detection
- Innovation scoring (weighted: Novelty 30%, Strength 20%, Maturity 15%, Market 20%, Funding 15%)
- Commercialization recommendations (Commercialize / License / Collaborate / Startup / Research)
- Innovation dashboard

### Executive & Reports (Milestone 4)
- **Executive Dashboard** — Aggregated platform overview with 6 summary cards, charts, and tables
- **Reports & Export** — PDF and Excel download for Funding, Research, Patent, Innovation, Commercialization
- **Analytics API** — Dedicated endpoints for funding, patent, innovation, and commercialization analytics
- **Docker deployment** — Separate Dockerfiles for backend/frontend with Docker Compose
- **Comprehensive testing** — Unit tests, security tests, performance tests

---

## API Endpoints

| Category | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| Auth | `/auth/register` | POST | Register new user |
| Auth | `/auth/login` | POST | Login and get JWT |
| Auth | `/auth/logout` | POST | Logout |
| Profile | `/profile/{user_id}` | GET/POST/PUT | Manage profile |
| Research | `/research/search?topic=` | GET | Search papers (OpenAlex) |
| Research | `/research/saved` | GET | Get saved papers |
| Funding | `/funding?area=` | GET | Search funding |
| Patents | `/patents?technology=` | GET | Search patents |
| Dashboard | `/dashboard/{user_id}` | GET | User dashboard |
| Dashboard | `/dashboard/executive` | GET | Executive dashboard |
| Recommendations | `/recommendations?user_id=` | GET | Funding recommendations |
| Analytics | `/analytics/publication-trends` | GET | Publication trends |
| Analytics | `/analytics/top-keywords` | GET | Top research keywords |
| Analytics | `/analytics/dashboard` | GET | Intelligence dashboard |
| Analytics | `/analytics/funding` | GET | Funding analytics |
| Analytics | `/analytics/patents` | GET | Patent analytics |
| Analytics | `/analytics/innovation` | GET | Innovation analytics |
| Analytics | `/analytics/commercialization` | GET | Commercialization data |
| Innovation | `/innovation/scores` | GET | Innovation scores |
| Innovation | `/innovation/dashboard` | GET | Innovation dashboard |
| Innovation | `/innovation/commercialization` | GET | Commercialization recs |
| Innovation | `/innovation/patent-landscape` | GET | Patent landscape |
| Innovation | `/innovation/patent-trends` | GET | Patent trends |
| Innovation | `/innovation/technology-intelligence` | GET | Tech intelligence |
| Innovation | `/innovation/emerging-technologies` | GET | Emerging tech |
| Reports | `/reports/funding/pdf` | GET | Funding PDF report |
| Reports | `/reports/research/pdf` | GET | Research PDF report |
| Reports | `/reports/patent/pdf` | GET | Patent PDF report |
| Reports | `/reports/innovation/pdf` | GET | Innovation PDF report |
| Reports | `/reports/commercialization/pdf` | GET | Commercialization PDF |
| Reports | `/reports/funding/excel` | GET | Funding Excel report |
| Reports | `/reports/patent/excel` | GET | Patent Excel report |
| Reports | `/reports/research/excel` | GET | Research Excel report |

---

## Quick Start (Development)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

---

## Docker Deployment

```bash
# Build and run
docker compose build
docker compose up

# Access
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
# Swagger:  http://localhost:8000/docs
```

---

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v --tb=short
```

Test modules:
- `test_auth.py` — Registration & login
- `test_profile.py` — Profile CRUD
- `test_funding.py` — Funding search
- `test_research.py` — Paper search
- `test_patents.py` — Patent search
- `test_innovation.py` — Innovation scoring & analysis
- `test_dashboard.py` — Dashboard endpoints
- `test_analytics.py` — Analytics endpoints
- `test_reports.py` — PDF & Excel generation
- `test_security.py` — Auth & validation security
- `test_performance.py` — Response time measurements

---

## End-to-End Workflow

```
Register → Login → Create Profile → Enter Research Interest
    → Search Research Papers → Get Funding Recommendations
    → View Research Trends → View Patent Intelligence
    → View Technology Trends → View Innovation Score
    → Get Commercialization Recommendation
    → Open Executive Dashboard → Generate Report
    → Download PDF / Excel
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Recharts, Lucide React |
| Backend | FastAPI, Python 3.11, Uvicorn |
| Database | SQLite (dev), PostgreSQL (production) |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Analytics | Pandas, NumPy |
| Reports | ReportLab (PDF), OpenPyXL (Excel) |
| Deployment | Docker, Docker Compose, Nginx |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
DATABASE_URL=sqlite:///./research_platform.db
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=60
VITE_API_URL=http://localhost:8000
```

---

## Documentation

- [Deployment Guide](DEPLOYMENT.md) — Comprehensive guide for local development, Docker, and cloud hosting (AWS, Azure, Railway, Render)
- [End-to-End Workflow](E2E_WORKFLOW.md) — Step-by-step evaluator demo workflow with 15 detailed steps
- [Final Completion Report](FINAL_REPORT.md) — Detailed summary of all 4 milestones, test coverage, and page inventory

---

## License

This project is developed for academic purposes.
