# 🏗️ Application Architecture

## System Design Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                               │
│  http://localhost:5173                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Frontend (React) │
                    │  • React Router   │
                    │  • Axios Client   │
                    │  • Dark UI        │
                    │  • 7 Pages        │
                    └─────────┬─────────┘
                              │
                    HTTP REST API + JWT
                              │
         ┌────────────────────┴────────────────────┐
         │                                         │
    ┌────▼───────────────────┐      ┌─────────────▼──────────────┐
    │  Backend (FastAPI)     │      │  GitHub Actions CI/CD      │
    │  http://127.0.0.0:8000 │      │  • Run Tests               │
    │  • 6 Modules           │      │  • Build Docker            │
    │  • 20+ Endpoints       │      │  • Coverage Reports        │
    │  • JWT Auth            │      └─────────────────────────────┘
    │  • SQLAlchemy ORM      │
    └────┬────────────────────┘
         │
    ┌────▼──────────────────┐
    │  Database (SQLite)    │
    │  • Users              │
    │  • Profiles           │
    │  • Research Papers    │
    │  • Funding (CSV)      │
    │  • Patents (CSV)      │
    └───────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Application                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Frontend    │  │  API Client  │  │  Storage     │          │
│  │  Components  │──│  (Axios)     │──│  (localStorage)         │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                           │                                     │
│                    JWT Token (Bearer)                           │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
            ┌───────────────▼────────────────┐
            │  REST API Gateway              │
            │  • CORS Middleware             │
            │  • Auth Interceptors           │
            │  • Error Handling              │
            └───────────────┬────────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    │                       │                       │
┌───▼──────────┐    ┌──────▼─────────┐    ┌──────▼──────────┐
│  Auth Routes │    │  Business      │    │  Data Routes   │
│              │    │  Logic Routes  │    │                │
│ • Register   │    │                │    │ • Research     │
│ • Login      │    │ • Profiles     │    │ • Funding      │
│ • Logout     │    │ • Dashboard    │    │ • Patents      │
└──────┬───────┘    └────────┬───────┘    └────────┬────────┘
       │                     │                     │
       └─────────────┬───────┴─────────┬───────────┘
                     │                 │
              ┌──────▼──────────┐  ┌──▼────────────┐
              │  SQLAlchemy ORM │  │  CSV Loaders  │
              │  • Models       │  │  • funding.py │
              │  • Sessions     │  │  • patents.py │
              └──────┬──────────┘  └─────┬─────────┘
                     │                   │
              ┌──────▼────────────┐  ┌──▼──────────┐
              │  SQLite Database  │  │  CSV Files  │
              │  • research_*     │  │  • funding  │
              │  • patents        │  │  • patents  │
              └───────────────────┘  └─────────────┘
```

---

## Module Dependencies

```
main.py (FastAPI App)
├── auth/
│   ├── router.py
│   ├── schemas.py (Pydantic models)
│   └── utils.py (JWT, password hashing)
├── profile/
│   ├── router.py
│   └── schemas.py
├── research/
│   ├── router.py
│   └── openalex.py (API integration)
├── funding/
│   ├── router.py
│   └── loader.py (CSV loading)
├── patents/
│   ├── router.py
│   └── loader.py (CSV loading)
├── dashboard/
│   └── router.py
└── database/
    ├── db.py (SQLAlchemy setup)
    └── models.py (ORM models)
```

---

## Testing Architecture

```
┌────────────────────────────────┐
│     Test Framework             │
│   Backend: pytest              │
│   Frontend: vitest             │
└────────────┬───────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
┌───▼──────────────┐  ┌──▼─────────────────┐
│  Backend Tests   │  │  Frontend Tests    │
│                  │  │                    │
│ • conftest.py    │  │ • setup.js         │
│ • test_auth.py   │  │ • App.test.jsx     │
│ • test_profile   │  │ • client.test.js   │
│ • test_endpoints │  │                    │
└───┬──────────────┘  └──┬─────────────────┘
    │                    │
    └────────┬───────────┘
             │
    ┌────────▼─────────┐
    │  Test Database   │
    │  (In-memory)     │
    └──────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────┐
│      Docker Image: ai-research      │
│         (Multi-stage build)         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Stage 1: Build Frontend    │   │
│  │  • Node base image          │   │
│  │  • npm install              │   │
│  │  • npm run build            │   │
│  │  • Output: dist/            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Stage 2: Runtime           │   │
│  │  • Python base image        │   │
│  │  • Install backend deps     │   │
│  │  • Copy backend code        │   │
│  │  • Copy built frontend      │   │
│  │  • Port: 8000 (expose)      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ENTRYPOINT: uvicorn server         │
└─────────────────────────────────────┘
         │
         │ docker run
         ▼
    ┌─────────────────┐
    │  Container      │
    │  http://...8000 │
    └─────────────────┘
```

---

## CI/CD Pipeline Flow

```
┌──────────────────────────────────────┐
│        Git Push / Pull Request       │
└────────────┬─────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │  GitHub Actions    │
    │  Workflow Trigger  │
    └────────┬───────────┘
             │
    ┌────────┴──────────┐
    │                   │
┌───▼──────────────┐  ┌──▼──────────────┐  ┌──────────────┐
│ Backend Tests    │  │ Frontend Tests  │  │ Docker Build │
│ (pytest)         │  │ (vitest+lint)   │  │              │
│ • Run tests      │  │ • Run tests     │  │ • Build img  │
│ • Coverage       │  │ • Run linter    │  │ • Validate   │
└───┬──────────────┘  └──┬─────────────┘   └──────────────┘
    │                    │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │  All Passed? ✅    │
    └────────┬───────────┘
             │
        (PASS/FAIL)
```

---

## Authentication Flow

```
┌──────────────────────────────────────────┐
│         User Login/Register              │
└────────────┬─────────────────────────────┘
             │
    ┌────────▼──────────┐
    │  POST /auth/      │
    │  • register       │
    │  • login          │
    └────────┬──────────┘
             │
    ┌────────▼──────────────────────┐
    │  Backend Validation           │
    │  • Email validation           │
    │  • Password hash check        │
    │  • Duplicate check            │
    └────────┬─────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │  Generate JWT Token           │
    │  • Header: token_type         │
    │  • Payload: user_id, username │
    │  • Expiry: 60 minutes         │
    └────────┬─────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │  Return Response              │
    │  • access_token               │
    │  • token_type: "bearer"       │
    │  • user: {...}                │
    └────────┬─────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │  Frontend Stores Token        │
    │  localStorage.setItem("token")│
    └────────┬─────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │  Subsequent Requests          │
    │  Header: "Bearer {token}"     │
    └───────────────────────────────┘
```

---

## Database Schema

```
Users Table
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── hashed_password
└── created_at

Profiles Table
├── id (PK)
├── user_id (FK → Users)
├── name
├── university
├── department
├── research_interests
├── keywords
├── research_area
├── created_at
└── updated_at

ResearchPapers Table
├── id (PK)
├── openalex_id (UNIQUE)
├── title
├── authors
├── publication_year
├── doi
├── abstract
├── search_topic
└── fetched_at

FundingOpportunity Table (CSV)
├── id (PK)
├── grant_name
├── organization
├── area
└── amount

Patent Table (CSV)
├── id (PK)
├── patent_id (UNIQUE)
├── title
├── inventor
├── technology
└── year
```

---

## Error Handling Flow

```
API Request
    │
    ├─► Validation Error
    │   └─► 400 Bad Request
    │
    ├─► Authentication Error
    │   ├─► Missing Token → 401 Unauthorized
    │   └─► Invalid Token → 401 Unauthorized
    │
    ├─► Authorization Error
    │   └─► 403 Forbidden
    │
    ├─► Resource Not Found
    │   └─► 404 Not Found
    │
    ├─► Server Error
    │   └─► 500 Internal Server Error
    │
    └─► Success
        └─► 200/201 OK/Created
            │
            └─► Response Body
                ├─► data
                ├─► message
                └─► metadata
```

---

## Scalability Considerations

```
Current Setup
├── Single Database (SQLite)
├── Single Backend Instance
├── Frontend: Static Build
└── Storage: Local File System

Scale-Up Path
├── → PostgreSQL (Multi-connection)
├── → Multiple Backend Instances (Load balancer)
├── → CDN (Static assets)
├── → S3/Cloud Storage (Files)
├── → Cache Layer (Redis)
├── → Message Queue (Celery/RabbitMQ)
└── → Container Orchestration (Kubernetes)
```

---

## Security Architecture

```
┌─────────────────────────────────────┐
│  Security Layers                    │
└─────────────────────────────────────┘

Layer 1: Network
├── HTTPS (in production)
├── CORS validation
└── CSP headers

Layer 2: Authentication
├── Password hashing (bcrypt)
├── JWT tokens
└── Token expiration

Layer 3: Input Validation
├── Pydantic schemas
├── Email validation
└── Type checking

Layer 4: Authorization
├── Token verification
├── User ownership checks
└── Role-based access

Layer 5: Data Protection
├── SQL injection prevention
├── XSS protection
└── CSRF tokens
```

---

## Performance Optimization

```
Frontend Optimization
├── Code Splitting (Vite)
├── Lazy Loading (React)
├── Image Optimization
└── CSS Minification

Backend Optimization
├── Database Indexing
├── Query Optimization
├── Async Operations
└── Response Caching

API Optimization
├── Pagination
├── Rate Limiting
├── Compression (gzip)
└── HTTP/2

Deployment Optimization
├── Multi-stage builds
├── Image layer caching
├── Resource limits
└── Health checks
```

---

## Monitoring & Logging

```
Application Health
├── Startup logs
├── Request logs
├── Error logs
├── Database logs
└── Performance metrics

Metrics to Track
├── API response time
├── Error rate
├── Database queries
├── Memory usage
├── Disk usage
├── CPU usage
└── Request count

Logging Destinations
├── Console (dev)
├── Files (production)
├── Cloud logging (optional)
└── Error tracking (Sentry, etc.)
```

---

## Disaster Recovery

```
Backup Strategy
├── Database backups (daily)
├── Code repository (Git)
├── Configuration backups
└── Docker image registry

Recovery Procedures
├── Database restore
├── Code rollback
├── Configuration restore
└── Image re-deploy

RTO/RPO Targets
├── Recovery Time Objective: <1 hour
├── Recovery Point Objective: <1 hour
└── Backup retention: 30 days
```

---

This architecture is:
- ✅ Scalable
- ✅ Maintainable
- ✅ Testable
- ✅ Secure
- ✅ Observable
- ✅ Production-Ready
