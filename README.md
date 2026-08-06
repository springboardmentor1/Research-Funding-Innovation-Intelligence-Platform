# Research Funding & Innovation Intelligence Platform

An AI-powered platform helping researchers, startups, and innovation managers
discover funding opportunities, track research and patent trends, and generate
commercialization guidance through a centralized dashboard.

## Architecture
rfip/
├── backend/ FastAPI + SQLAlchemy + PostgreSQL (Docker-ready)
└── frontend/ React + Vite, dark "instrument panel" UI

Backend: JWT auth with 4 roles (Researcher, Startup Founder, Innovation Manager,
Administrator), a funding recommendation engine, live OpenAlex-backed research
trend analysis, patent landscape analytics, a weighted Innovation Scoring Engine,
rule-based commercialization recommendations, role-specific dashboards,
computed alerts, and CSV/PDF report export.

Frontend: role-aware navigation, live dashboards per role, and a signature
radial gauge visualizing the innovation score formula
(Research Novelty 30% / Patent Strength 20% / Technology Maturity 15% /
Market Potential 20% / Funding Relevance 15%).

## Tech stack

- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL (SQLite for local dev), JWT
- **Frontend**: React 19, Vite, React Router, Axios
- **Data sources**: OpenAlex API (publications), seeded patent/funding datasets
  (swap-in ready for PatentsView, Grants.gov, NIH RePORTER, CORDIS APIs)
- **Deployment**: Docker (backend + Postgres), Render (backend), Vercel (frontend)

## Local development

**Backend**
```bash
cd backend
conda activate rfip
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```
API docs: http://127.0.0.1:8000/docs

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
App: http://localhost:5173

**Seed sample data** (run once, from `backend/`):
```bash
python -m app.seed_data.seed_funding
python -m app.seed_data.seed_patents
```

## Docker (local, backend + Postgres)

```bash
cd backend
docker compose up --build
```

## API overview (30 endpoints)

| Group | Endpoints |
|---|---|
| Auth | register, login, me |
| Research Profile | get/update/get-by-id |
| Funding Discovery | create/list/search opportunities, recommendations |
| Research Intelligence | publication trend analysis (OpenAlex) |
| Patent Analytics | create/list/search patents, clusters, trends, competitors |
| Technology Intelligence | maturity classification |
| Innovation Scoring | weighted score, commercialization recommendations |
| Dashboards | researcher, innovation, startup, innovation-manager |
| Admin | user management, platform stats |
| Reports | funding.csv, patents.csv, innovation.pdf |
| Notifications | computed alerts |

Full interactive docs at `/docs` on any running instance.

## Known limitations

- No automated test suite (pytest) yet — testing was done interactively
- Alerts are computed on-demand, not pushed via email/websocket
- No OAuth2/social login, password auth only
- Technology maturity classification is heuristic-based, not ML-trained
- No Alembic migrations — tables are created directly via `Base.metadata.create_all`

## Deployment

See `DEPLOYMENT.md` for the full Render + Vercel runbook.

## Live Demo
- Frontend: https://rfip-drab.vercel.app/
- Backend API: https://rfip-backend.onrender.com
- API Docs (Swagger): https://rfip-backend.onrender.com/docs
