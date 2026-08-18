# Research Funding & Innovation Intelligence Platform
### Milestone 1 — Project Initialization, Design Process & Core Setup

Production-ready foundation for the AI-Powered Research Funding & Innovation
Intelligence Platform: authentication (JWT + OAuth2), role-based access
control, and Research Profile Management, built with Clean Architecture.

> **Scope note:** This repository implements **Milestone 1 only**, per the
> project's week-wise plan. Funding discovery, research trend intelligence,
> patent analytics, innovation scoring, and commercialization recommendations
> (Milestones 2–4) are intentionally out of scope here — the dashboard
> includes a visible roadmap placeholder for them.

---

## 1. What's included

- ✅ User registration, login, JWT access/refresh tokens
- ✅ Google OAuth2 login (OpenID Connect ID-token verification)
- ✅ Role-Based Access Control — **Researcher, Startup Founder, Innovation
  Manager, Administrator**
- ✅ Research Profile Management — biography, organization, research domains,
  keywords, technology areas, plus nested Publications and Patents
- ✅ Admin user management endpoints (list, activate/deactivate, change role)
- ✅ PostgreSQL (primary relational store) + MongoDB (audit/activity logs)
- ✅ Alembic migrations
- ✅ Structured logging + centralized exception handling
- ✅ Swagger UI (`/docs`) and ReDoc (`/redoc`) auto-generated API docs
- ✅ Dockerized backend, frontend, PostgreSQL and MongoDB via Docker Compose
- ✅ React (Vite) + Tailwind CSS frontend: Login, Register, Dashboard, Profile

---

## 2. Architecture

```
┌────────────────────┐        ┌──────────────────────────────────┐
│   React Frontend    │  HTTP  │            FastAPI Backend        │
│  (Vite + Tailwind)  │◄──────►│         (Clean Architecture)      │
└────────────────────┘        │                                    │
                               │  api/          → routers, deps     │
                               │  services/     → business logic    │
                               │  repositories/ → data access        │
                               │  models/       → SQLAlchemy ORM     │
                               │  schemas/      → Pydantic I/O       │
                               │  core/         → config/security/  │
                               │                  logging/exceptions │
                               └─────────┬───────────────┬──────────┘
                                         │               │
                                 ┌───────▼──────┐  ┌───────▼────────┐
                                 │  PostgreSQL   │  │    MongoDB      │
                                 │ (users,       │  │ (activity_logs) │
                                 │  research     │  │                 │
                                 │  profiles,    │  │                 │
                                 │  publications,│  │                 │
                                 │  patents)     │  │                 │
                                 └───────────────┘  └─────────────────┘
```

See [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md) for the full entity-relationship
diagram and schema design notes.

### Folder structure

```
funding-innovation-platform/
├── docker-compose.yml
├── docs/
│   └── ER_DIAGRAM.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/0001_initial_schema.py
│   └── app/
│       ├── main.py                  # FastAPI entrypoint
│       ├── core/                    # config, security, logging, exceptions
│       ├── db/                      # postgres.py, mongo.py, base.py
│       ├── models/                  # SQLAlchemy ORM models
│       ├── schemas/                 # Pydantic request/response models
│       ├── repositories/            # data-access layer
│       ├── services/                # business logic layer
│       ├── middleware/              # request logging middleware
│       └── api/
│           ├── deps.py              # auth + RBAC dependencies
│           └── v1/
│               ├── router.py
│               └── endpoints/       # auth.py, users.py, research_profile.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── main.jsx / App.jsx
        ├── api/axiosClient.js       # JWT interceptor + auto refresh
        ├── context/AuthContext.jsx
        ├── components/              # Navbar, ProtectedRoute, RoleBadge
        └── pages/                   # Login, Register, Dashboard, Profile
```

---

## 3. Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| Auth | JWT (python-jose), OAuth2 (Google), Passlib/bcrypt |
| Databases | PostgreSQL 16 (primary), MongoDB 7 (activity logs, via Motor) |
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3, Axios |
| DevOps | Docker, Docker Compose, Gunicorn/Uvicorn, Nginx (prod frontend) |

---

## 4. Getting started (Docker — recommended)

```bash
# 1. Clone/unzip the project, then from the project root:
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Edit backend/.env and set a strong SECRET_KEY (and Google OAuth
#    credentials if you want Google login to work).

# 3. Build and start everything
docker compose up --build
```

- Frontend → http://localhost:5173
- Backend API → http://localhost:8000
- Swagger UI → http://localhost:8000/docs
- ReDoc → http://localhost:8000/redoc

The backend container automatically runs `alembic upgrade head` on startup,
so the database schema is created for you.

---

## 5. Getting started (manual / local development)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: point DATABASE_URL and MONGO_URI at your local Postgres/Mongo

alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## 6. Authentication & RBAC model

| Role | Value | Notes |
|---|---|---|
| Researcher | `researcher` | Default role at registration |
| Startup Founder | `startup_founder` | Self-selectable at registration |
| Innovation Manager | `innovation_manager` | Self-selectable at registration |
| Administrator | `administrator` | **Cannot** be self-assigned at registration; must be granted by an existing admin via `PATCH /users/{id}/role` |

- Access tokens are short-lived (default 60 min); refresh tokens last 7 days
  (configurable via `.env`).
- `Depends(require_roles(UserRole.ADMINISTRATOR))` in `api/deps.py` is the
  reusable RBAC guard — apply it to any endpoint that should be role-gated.

---

## 7. Key API endpoints

Full interactive documentation lives at `/docs`. Summary:

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register a new account | Public |
| POST | `/api/v1/auth/login` | Login with email + password | Public |
| POST | `/api/v1/auth/refresh` | Exchange refresh token for new access token | Public (valid refresh token) |
| POST | `/api/v1/auth/oauth/google` | Login/register via Google ID token | Public |
| GET | `/api/v1/auth/me` | Current user | Bearer token |
| GET/PUT | `/api/v1/users/me` | View/update own profile | Bearer token |
| POST | `/api/v1/users/me/change-password` | Change password | Bearer token |
| GET | `/api/v1/users` | List all users | Admin only |
| PATCH | `/api/v1/users/{id}/activate\|deactivate\|role` | Manage a user | Admin only |
| GET/POST/PUT | `/api/v1/research-profile/me` | View/create/update research profile | Bearer token |
| POST | `/api/v1/research-profile/me/publications` | Add a publication | Bearer token |
| POST | `/api/v1/research-profile/me/patents` | Add a patent | Bearer token |

---

## 8. Security & production notes

- Passwords are hashed with bcrypt; never stored or logged in plaintext.
- All predictable errors flow through a typed `AppException` hierarchy
  (`core/exceptions.py`) mapped to clean JSON error responses; unhandled
  exceptions are caught, logged with a stack trace, and returned as a generic
  500 without leaking internals.
- CORS origins, secret keys, and database credentials are all environment-
  driven — **never commit a real `.env` file** (already gitignored).
- Before deploying to production: rotate `SECRET_KEY`, set `DEBUG=False`,
  restrict `BACKEND_CORS_ORIGINS` to your real frontend domain, and put the
  backend behind HTTPS (e.g. via a reverse proxy / load balancer).

---

## 9. Validation performed

- ✅ All backend Python modules parse and import cleanly (`app.main:app`
  loads with 24 registered routes)
- ✅ OpenAPI schema generates successfully
- ✅ Frontend (`npm run build`) compiles with zero errors
- ✅ Alembic migration file syntax-checked

---

## 10. Next milestones (not implemented here)

- **Milestone 2:** Funding Opportunity Discovery, Research Trend Intelligence
- **Milestone 3:** Patent Landscape Analysis, Technology Intelligence,
  Innovation Scoring Engine, Commercialization Recommendations
- **Milestone 4:** Full dashboards/analytics/reports, security & performance
  testing, production deployment
