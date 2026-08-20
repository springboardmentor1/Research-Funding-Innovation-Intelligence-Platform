# Research Funding & Innovation Intelligence Platform
### Milestones 1, 2 & 3 — Core Platform + Funding Management + Innovation Analytics

Production-ready foundation for the AI-Powered Research Funding & Innovation
Intelligence Platform: authentication (JWT + OAuth2), role-based access
control, Research Profile Management, Funding Opportunity Management with
advanced search, an application-tracking workflow, bookmarks, a notification
system, an admin analytics dashboard, file uploads, and — new in Milestone 3 —
Patent Landscape Analysis, Technology Intelligence, an Innovation Scoring
Engine, and a rule-based Commercialization Recommendation module, all tied
together in an Innovation Analytics Dashboard. Built with Clean Architecture
(repository-service pattern).

> **Scope note:** This repository implements **Milestones 1, 2, and 3**.
> Research Trend Intelligence (publication trend analysis, research
> hotspot/topic detection — distinct from the Patent Landscape Analysis and
> Technology Intelligence delivered here) plus executive dashboards, reports
> & export, and production deployment hardening (Milestone 4) remain out of
> scope.


---

## 1. What's included

**Milestone 1:**
- ✅ User registration, login, JWT access/refresh tokens
- ✅ Google OAuth2 login (OpenID Connect ID-token verification)
- ✅ Role-Based Access Control — **Researcher, Startup Founder, Innovation
  Manager, Administrator**
- ✅ Research Profile Management — biography, organization, research domains,
  keywords, technology areas, plus nested Publications and Patents
- ✅ Admin user management endpoints (list, activate/deactivate, change role)

**Milestone 2:**
- ✅ Funding Opportunity Management (CRUD) — Administrator/Innovation Manager
  only, with a draft → published → closed → archived workflow
- ✅ Advanced search — free-text query, funding source type, status, research
  domain / technology area overlap, amount range, deadline range, sorting,
  pagination
- ✅ Profile-based recommendations (overlap-scored against a researcher's
  research domains/technology areas)
- ✅ Application tracking — submit, withdraw, admin/manager review
  (under_review/accepted/rejected), duplicate-application prevention
- ✅ Bookmarks — save/unsave/list funding opportunities
- ✅ Notifications — auto-dispatched on new matching opportunities and on
  application status changes; unread count, mark read/mark all read
- ✅ Admin analytics dashboard — user/opportunity/application counts by
  status, applications trend, top research domains
- ✅ File uploads — opportunity attachments and application documents
  (local disk storage behind a swappable `StorageBackend` interface)

**Cross-cutting:**
- ✅ PostgreSQL (primary relational store) + MongoDB (audit/activity logs)
- ✅ Alembic migrations
- ✅ Structured logging + centralized exception handling
- ✅ Swagger UI (`/docs`) and ReDoc (`/redoc`) auto-generated API docs
- ✅ Dockerized backend, frontend, PostgreSQL and MongoDB via Docker Compose,
  with a persistent volume for uploaded files
- ✅ React (Vite) + Tailwind CSS frontend: Login, Register, Dashboard,
  Profile, Funding Discovery, Opportunity Detail/Edit, Applications,
  Bookmarks, Notifications, Admin Dashboard

**Milestone 3:**
- ✅ Patent Landscape Analysis — cross-profile search, filing trend by
  year, classification/domain clustering, competitor (assignee) analysis,
  and a technology-domain × classification innovation map
- ✅ Technology Intelligence — an admin-curated technology catalog with
  computed-on-read adoption metrics (patents, funding coverage, researcher
  adoption), emerging-technology detection, maturity breakdown, funding-gap
  ("innovation opportunity") analysis, and competitive monitoring per
  technology
- ✅ Innovation Scoring Engine — a weighted, 5-component, timestamped score
  per research profile (Research Novelty 30% / Patent Strength 20% /
  Technology Maturity 15% / Market Potential 20% / Funding Relevance 15%),
  with history and a platform-wide leaderboard
- ✅ Commercialization Recommendation Module — rule-based, transparent
  recommendations (productization / licensing / startup creation / industry
  partnership) generated from a profile's latest innovation score, each
  traceable back to the specific score snapshot and components that
  triggered it
- ✅ Innovation Analytics Dashboard — a tabbed frontend page tying all four
  modules above together, matching the Milestone 2 Admin Dashboard pattern

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
│   │   └── versions/
│   │       ├── 0001_initial_schema.py
│   │       └── 0002_milestone2_schema.py
│   └── app/
│       ├── main.py                  # FastAPI entrypoint (+ /uploads static mount)
│       ├── core/                    # config, security, logging, exceptions
│       ├── db/                      # postgres.py, mongo.py, base.py
│       ├── models/                  # SQLAlchemy ORM models
│       │   ├── user.py, research_profile.py            (Milestone 1)
│       │   └── funding_opportunity.py, application.py,
│       │       bookmark.py, notification.py            (Milestone 2)
│       ├── schemas/                 # Pydantic request/response models
│       │   └── common.py            # generic PaginationParams / PaginatedResponse
│       ├── repositories/            # data-access layer
│       ├── services/                # business logic layer
│       │   └── storage_service.py   # StorageBackend port + LocalFileStorage adapter
│       ├── middleware/              # request logging middleware
│       └── api/
│           ├── deps.py              # auth + RBAC dependencies
│           └── v1/
│               ├── router.py
│               └── endpoints/       # auth, users, research_profile,
│                                    # funding_opportunities, applications,
│                                    # bookmarks, notifications, analytics
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
        ├── components/              # Navbar, ProtectedRoute, RoleBadge,
        │   │                        # Pagination, StatusBadges, Modal,
        │   │                        # MiniBarChart, NotificationsBell
        │   └── admin/                # AnalyticsOverview, OpportunityManager,
        │                             # ApplicationReviewTable
        └── pages/                   # Login, Register, Dashboard, Profile,
                                      # FundingDiscovery, OpportunityDetail,
                                      # OpportunityEdit, Applications,
                                      # Bookmarks, Notifications, AdminDashboard
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
| GET | `/api/v1/funding-opportunities` | Advanced search (filters, sorting, pagination) | Bearer token |
| GET | `/api/v1/funding-opportunities/recommended/me` | Profile-based recommendations | Bearer token |
| POST/PUT/DELETE | `/api/v1/funding-opportunities` / `/{id}` | Create/update/delete a funding opportunity | Admin / Innovation Manager |
| POST | `/api/v1/funding-opportunities/{id}/attachment` | Upload an opportunity attachment | Admin / Innovation Manager |
| POST | `/api/v1/applications/opportunities/{id}` | Submit an application | Bearer token |
| GET | `/api/v1/applications/me` | List my applications | Bearer token |
| PATCH | `/api/v1/applications/{id}/withdraw` | Withdraw my application | Bearer token (owner) |
| POST | `/api/v1/applications/{id}/document` | Upload a supporting document | Bearer token (owner) |
| GET | `/api/v1/applications` | List all applications | Admin / Innovation Manager |
| PATCH | `/api/v1/applications/{id}/review` | Move status to under_review/accepted/rejected | Admin / Innovation Manager |
| GET/POST/DELETE | `/api/v1/bookmarks/me` / `/{opportunity_id}` | List/add/remove a bookmark | Bearer token |
| GET | `/api/v1/notifications/me` | List my notifications | Bearer token |
| GET | `/api/v1/notifications/me/unread-count` | Unread notification count | Bearer token |
| PATCH | `/api/v1/notifications/{id}/read` / `/read-all` | Mark (all) notifications read | Bearer token |
| GET | `/api/v1/admin/analytics/overview` | Aggregate platform counts | Admin only |
| GET | `/api/v1/admin/analytics/applications-trend` | Daily application counts | Admin only |
| GET | `/api/v1/admin/analytics/top-research-domains` | Most common research domains | Admin only |

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

**Milestone 1:**
- ✅ All backend Python modules parse and import cleanly
- ✅ OpenAPI schema generates successfully
- ✅ Frontend (`npm run build`) compiles with zero errors

**Milestone 2 — validated against a real, live PostgreSQL instance** (not just
import checks): ran both Alembic migrations against a real database, then
drove the full stack through `TestClient` with real HTTP requests:
- ✅ Registration, login, RBAC enforcement (non-managers correctly blocked
  with 403 from creating opportunities / reviewing applications / viewing
  analytics)
- ✅ Opportunity creation → auto-dispatched "new funding match" notification
  correctly reached a researcher whose profile overlapped the opportunity's
  domains
- ✅ Search, profile-based recommendations, bookmarking (including duplicate
  rejection), full application lifecycle (submit → duplicate rejected →
  reviewed/accepted → status-change notification fired → reviewer comment
  visible to applicant)
- ✅ Admin analytics overview returned correct live counts
- ✅ File uploads: valid attachment saved to disk and served back byte-for-byte
  identical; invalid file type rejected with `422`

**Bug found and fixed via this live testing** (not by inspection): uploading
a rejected file (e.g. wrong extension) after a valid attachment already
existed **deleted the working attachment before validating the new one**,
leaving the database pointing at a file that no longer existed on disk. Fixed
in both `funding_opportunity_service.upload_attachment` and
`application_service.upload_document` by saving (and validating) the new file
*before* deleting the old one — re-verified: a rejected re-upload now leaves
the original attachment fully intact and servable, while a legitimate
replacement still correctly cleans up the old file.

Two more issues caught during this same testing pass: `ResearchProfile` and
`FundingOpportunity` were declared with the generic `sqlalchemy.ARRAY` type
rather than `sqlalchemy.dialects.postgresql.ARRAY`, which lacks the
`.overlap()` comparator needed for domain/tech-area matching — both fixed.

## 10. Next milestones (not implemented here)

- **Milestone 3 addendum:** Research Trend Intelligence (publication trend
  analysis, emerging topic/hotspot detection, citation analytics) was part
  of the original spec's Milestone 3 scope but was not built here — the
  Patent Landscape Analysis and Technology Intelligence modules cover
  adjacent ground but are distinct from publication-focused trend analysis
- **Milestone 4:** Executive dashboards, a reports & export system (PDF/Excel),
  security and performance testing, and production deployment hardening

An automated `pytest` test suite is also not yet present in this repository
— everything referenced as "live-tested" throughout this README and prior
milestone summaries was validated via one-off scripts run against a real
PostgreSQL instance during development, not committed as a reusable,
CI-runnable test suite. This remains a meaningful gap before further scope
is added.
