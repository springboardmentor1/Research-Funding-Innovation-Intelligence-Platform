# Research Funding & Innovation Intelligence Platform
### Milestones 1–4 — Complete Platform (all 12 spec modules implemented)

Production-ready, full-featured build of the AI-Powered Research Funding &
Innovation Intelligence Platform: authentication (JWT + OAuth2), role-based
access control, Research Profile Management, Funding Opportunity Management
with advanced search, an application-tracking workflow, bookmarks, a
notification system, an admin analytics dashboard, file uploads, Patent
Landscape Analysis, Technology Intelligence, an Innovation Scoring Engine, a
rule-based Commercialization Recommendation module, Research Trend
Intelligence, an Executive Dashboard, and a PDF/Excel Reports & Export
system — all tied together with a `pytest` suite and CI. Built with Clean
Architecture (repository-service pattern).

> **Scope note:** This repository implements the full spec, **Milestones
> 1 through 4**. See section 10 below for what's new in Milestone 4.



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
| GET | `/api/v1/research-trends/*` | Publication trend, emerging topics, hotspots, citation analytics | Bearer token |
| GET | `/api/v1/executive-dashboard/summary` | Cross-module KPI summary | Admin / Innovation Manager |
| GET | `/api/v1/reports` / `/{report_type}/{pdf\|excel}` | Report catalog + PDF/Excel export | Admin / Innovation Manager |

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

## 10. Milestone 4 — Analytics, Testing & Deployment

This milestone closes out the platform: it fills the one remaining spec gap
(Research Trend Intelligence), adds the executive-facing analytics layer
(Executive Dashboard + Reports & Export), introduces an automated,
CI-runnable `pytest` suite, and hardens the deployment/observability story.

### 10.1 Research Trend Intelligence Module (spec section 4, module 4)

Flagged as an addendum at the end of Milestone 3 and built here: publication
trend analysis, emerging topic detection, research hotspot identification,
domain trend monitoring, and citation analytics — all computed from the
existing `publications` table (no new table added).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/research-trends/overview` | Composite payload for the dashboard page |
| GET | `/api/v1/research-trends/publication-trend` | Publications + citations per year |
| GET | `/api/v1/research-trends/emerging-topics` | Fastest-growing domains/keywords |
| GET | `/api/v1/research-trends/hotspots` | Domains ranked by recent activity |
| GET | `/api/v1/research-trends/domain-trends` | Recent vs. prior counts + growth rate per domain |
| GET | `/api/v1/research-trends/citation-analytics` | Platform-wide citation summary |
| GET | `/api/v1/research-trends/top-cited` | Most-cited publications |

### 10.2 Executive Dashboard (spec section 4.9)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/executive-dashboard/summary` | Headline KPI from every module in one payload | Admin / Innovation Manager |

### 10.3 Reports & Export System (spec section 4.11)

Five report types — **Funding, Patent, Research Trend, Innovation
Intelligence, Commercialization** — each exportable as PDF (`reportlab`) or
Excel (`openpyxl`). Every report is built from the same `ReportPayload` /
`ReportSection` structure so PDF and Excel rendering stay in sync.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/reports` | Catalog of available report types | Admin / Innovation Manager |
| GET | `/api/v1/reports/{report_type}/{pdf\|excel}` | Generate and download a report | Admin / Innovation Manager |

### 10.4 Testing & validation (spec section 4.12)

A `pytest` suite (`backend/tests/`) — **54 tests, all passing** — runs
against a **real PostgreSQL** database (not SQLite), because several models
use Postgres-native `ARRAY` columns and Alembic-managed native enum types
that SQLite can't represent faithfully. `tests/conftest.py` applies the
actual Alembic migrations to a dedicated test database once per session and
truncates all tables between tests for isolation.

Coverage: authentication + RBAC (all 4 roles, every protected route),
research profile management, funding discovery/applications/bookmarks,
patent analysis, technology intelligence, innovation scoring,
commercialization, the new research trend intelligence module, the reports
system (every report type × both formats, verified as real PDF/XLSX bytes —
not just a 200 status), and the executive dashboard (including that
Researcher/Startup Founder correctly get `403`).

```bash
cd backend
pip install -r requirements.txt
export TEST_DATABASE_URL="postgresql+psycopg2://innovation_user:innovation_pass@localhost:5432/innovation_platform_test"
pytest -v
```

`.github/workflows/ci.yml` runs this same suite against a Postgres service
container on every push/PR, then separately builds the frontend and both
Docker images.

### 10.5 Deployment & observability hardening

- `/health` — plain liveness probe (unchanged from Milestone 1).
- `/health/ready` — **new** readiness probe: actually executes `SELECT 1`
  against Postgres and reports `{"status": "ready", "postgres": true}` or
  `not_ready`, matching the Kubernetes liveness-vs-readiness distinction
  called out in the spec's monitoring requirements. Use this one (not
  `/health`) as your orchestrator's readiness check.
- `docker-compose.yml` continues to define the full stack (backend,
  frontend, Postgres, Mongo) for local/staging use exactly as in Milestone 3.
- GitHub Actions CI (`.github/workflows/ci.yml`) now provides the
  "GitHub Actions" line item from the spec's tech stack — automated test
  and build validation on every push, not just a manually-run local check.

## 11. Validation performed — Milestone 4

Verified in this sandbox against a **real, locally-installed PostgreSQL 16**
instance (`apt install postgresql`), not SQLite or mocks:

- ✅ `alembic upgrade head` applied cleanly to a fresh database
- ✅ App imports cleanly with all Milestone 4 routers wired in (83 total routes)
- ✅ Live end-to-end HTTP smoke test via `uvicorn` + `curl`: register admin +
  researcher → create research profile → add publications → hit
  `/research-trends/overview` (emerging topics / hotspots / citation
  analytics all correctly reflect the seeded data) → hit
  `/executive-dashboard/summary` → download all 5 reports in both PDF and
  Excel formats and confirm real `%PDF` / `PK` (zip) magic bytes, correct
  byte sizes, and correct `Content-Disposition` filenames
- ✅ RBAC verified live: Researcher gets `403` from `/reports` and
  `/executive-dashboard/summary`; Innovation Manager is correctly allowed
- ✅ Full `pytest` suite: **54/54 passing** against the real test database
- ✅ `npm run build` — frontend compiles with zero errors, new
  Research Trends tab / Executive Summary tab / Reports & Export tab all
  build cleanly into the bundle
- ✅ `npx vite preview` served the production build successfully

**Issue caught during live testing:** the initial Mongo-backed activity
logging call in `auth_service.register()` would hang for the Motor driver's
default 30s server-selection timeout in any environment without a MongoDB
instance running (e.g. CI). Since `log_activity()` already swallows
connection failures by design, this only affected *how long* the failure
took — fixed by giving the test/CI Mongo URI explicit short
`serverSelectionTimeoutMS`/`connectTimeoutMS` values; production behavior
(a real Mongo instance) is unaffected.

## 12. Project status

All 12 modules from the original specification are now implemented:
Authentication & RBAC, Research Profile Management, Funding Opportunity
Discovery, Research Trend Intelligence, Patent Landscape Analysis,
Technology Intelligence, Innovation Scoring Engine, Commercialization
Recommendations, Dashboards & Analytics (including the Executive
Dashboard), Notifications & Alerts, Reports & Export, and Final
Integration/Testing/Deployment.
