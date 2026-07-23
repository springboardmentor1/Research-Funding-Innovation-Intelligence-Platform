# 📐 AI Research Funding Platform - Architecture Diagram

## Complete System Architecture

```
╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                    COMPLETE SYSTEM ARCHITECTURE                                ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝


                              ┌─────────────────────────────────────┐
                              │   BROWSER / CLIENT DEVICE           │
                              │   User visits: localhost:5173       │
                              └──────────────┬──────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      │                                             │
              ┌───────▼──────────────────┐              ┌──────────▼────────────┐
              │   FRONTEND LAYER        │              │  LOCAL STORAGE        │
              │   (React + Vite)        │◄────────────►│  • JWT Token          │
              │                          │              │  • User Profile       │
              │ ┌────────────────────┐  │              │  • Preferences        │
              │ │ Components         │  │              └───────────────────────┘
              │ │ • Login            │  │
              │ │ • Register         │  │
              │ │ • Dashboard        │  │
              │ │ • Profile          │  │
              │ │ • ResearchSearch   │  │
              │ │ • FundingSearch    │  │
              │ │ • PatentSearch     │  │
              │ └────────────────────┘  │
              │                          │
              │ ┌────────────────────┐  │
              │ │ Axios HTTP Client  │  │
              │ │ • Base URL Config  │  │
              │ │ • Auth Interceptor │  │
              │ │ • Error Handler    │  │
              │ └────────────────────┘  │
              └───────┬──────────────────┘
                      │
                      │ HTTP REST API + JWT Bearer Token
                      │ (CORS Enabled)
                      │
        ┌─────────────▼──────────────┐
        │   API GATEWAY              │
        │   Port: 8000               │
        │   http://127.0.0.1:8000    │
        │                            │
        │ • CORS Middleware          │
        │ • Auth Verification        │
        │ • Request Logging          │
        └─────────────┬──────────────┘
                      │
        ┌─────────────┴────────────────────────────────────────┐
        │                                                       │
        │          BACKEND LAYER (FastAPI)                    │
        │                                                       │
    ┌───▼─────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  AUTH MODULE    │  │ BUSINESS LOGIC  │  │   DATA MODULE   │
    │                 │  │                 │  │                 │
    │ • Register      │  │ • Dashboard     │  │ • Research      │
    │ • Login         │  │ • Profile Mgmt  │  │ • Funding       │
    │ • JWT Token     │  │ • Aggregation   │  │ • Patents       │
    │ • Validation    │  │                 │  │                 │
    └────┬────────────┘  └────┬────────────┘  └────┬────────────┘
         │                    │                    │
         └────────┬───────────┴────────────────────┘
                  │
        ┌─────────▼─────────────────┐
        │  DATA ACCESS LAYER        │
        │  (SQLAlchemy ORM)         │
        │                           │
        │ • Session Management      │
        │ • Query Building          │
        │ • Relationship Mapping    │
        └─────────┬─────────────────┘
                  │
        ┌─────────▼─────────────────┐
        │  DATABASE LAYER           │
        │  SQLite                   │
        │  research_platform.db     │
        │                           │
        │ ┌──────────────────────┐  │
        │ │ TABLES:              │  │
        │ │ • users              │  │
        │ │ • profiles           │  │
        │ │ • research_papers    │  │
        │ │ • research_topics    │  │
        │ └──────────────────────┘  │
        └───────────────────────────┘

                      ┌─────────────────────────────────────┐
                      │   EXTERNAL SERVICES                 │
                      │                                     │
                      │ ┌────────────────────────────────┐ │
                      │ │ OpenAlex API                   │ │
                      │ │ (Research Papers)             │ │
                      │ └────────────────────────────────┘ │
                      │                                     │
                      │ ┌────────────────────────────────┐ │
                      │ │ CSV Data Files                 │ │
                      │ │ • funding.csv                  │ │
                      │ │ • patents.csv                  │ │
                      │ └────────────────────────────────┘ │
                      └─────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                              DEPLOYMENT & INFRASTRUCTURE LAYER                                 ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝

    ┌──────────────────────────────────────────────────────────────────────┐
    │                    DOCKER CONTAINERIZATION                           │
    │                                                                      │
    │  ┌────────────────────────────────────┐                             │
    │  │  Backend Container                 │                             │
    │  │  • Python 3.11                     │                             │
    │  │  • FastAPI + Uvicorn               │                             │
    │  │  • SQLite Database                 │                             │
    │  │  Port: 8000                        │                             │
    │  └────────────────────────────────────┘                             │
    │                                                                      │
    │  ┌────────────────────────────────────┐                             │
    │  │  Frontend Container                │                             │
    │  │  • Node.js 20                      │                             │
    │  │  • Vite Dev Server                 │                             │
    │  │  • React Application               │                             │
    │  │  Port: 5173                        │                             │
    │  └────────────────────────────────────┘                             │
    │                                                                      │
    │  Network: ai-research (Docker Network)                              │
    └──────────────────────────────────────────────────────────────────────┘

            ┌──────────────────────────────────┐
            │    CI/CD PIPELINE                │
            │    GitHub Actions                │
            │                                  │
            │ 1. Run Backend Tests (pytest)    │
            │ 2. Run Frontend Tests (vitest)   │
            │ 3. Build Docker Image            │
            │ 4. Code Coverage Reports         │
            │ 5. Linting & Quality Checks      │
            └──────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                      TESTING ARCHITECTURE                                      ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝

    Backend Testing (pytest)                Frontend Testing (vitest)
    ┌─────────────────────────────┐       ┌────────────────────────────┐
    │ • test_auth.py              │       │ • App.test.jsx             │
    │   - Register user           │       │   - Component rendering    │
    │   - Login validation        │       │   - Route structure        │
    │   - JWT generation          │       │   - Auth guard logic       │
    │                             │       │                            │
    │ • test_profile.py           │       │ • client.test.js           │
    │   - Profile CRUD            │       │   - API client config      │
    │   - User associations       │       │   - Interceptors           │
    │   - Data validation         │       │   - CRUD methods           │
    │                             │       │                            │
    │ • test_endpoints.py         │       └────────────────────────────┘
    │   - API responses           │
    │   - Status codes            │
    │   - Error handling          │
    └─────────────────────────────┘


╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                               AUTHENTICATION & SECURITY FLOW                                   ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝

    User                Frontend              Backend              Database
      │                    │                    │                    │
      │                    │                    │                    │
      │  1. Register       │                    │                    │
      ├───────────────────►│                    │                    │
      │                    │ POST /auth/register│                    │
      │                    ├───────────────────►│                    │
      │                    │                    │ Hash Password      │
      │                    │                    ├──────────────┐     │
      │                    │                    │◄─────────────┘     │
      │                    │                    │                    │
      │                    │                    │ INSERT User        │
      │                    │                    ├───────────────────►│
      │                    │                    │◄───────────────────┤
      │                    │ 201 Created        │                    │
      │                    │◄───────────────────┤                    │
      │                    │ {user_data}        │                    │
      │  User Created      │                    │                    │
      │◄───────────────────┤                    │                    │
      │                    │                    │                    │
      │  2. Login          │                    │                    │
      ├───────────────────►│                    │                    │
      │                    │ POST /auth/login   │                    │
      │                    ├───────────────────►│                    │
      │                    │                    │ SELECT User        │
      │                    │                    ├───────────────────►│
      │                    │                    │◄───────────────────┤
      │                    │                    │                    │
      │                    │                    │ Verify Password    │
      │                    │                    │ Generate JWT       │
      │                    │                    │                    │
      │                    │ 200 OK             │                    │
      │                    │◄───────────────────┤                    │
      │                    │ {token, user}      │                    │
      │  Store Token       │                    │                    │
      │◄───────────────────┤                    │                    │
      │ localStorage       │                    │                    │
      │                    │                    │                    │
      │  3. Authenticated Request               │                    │
      ├───────────────────►│                    │                    │
      │                    │ GET /dashboard/1   │                    │
      │                    │ Header: Authorization: Bearer {token}   │
      │                    ├───────────────────►│                    │
      │                    │                    │ Verify Token       │
      │                    │                    │ Extract user_id    │
      │                    │                    │                    │
      │                    │                    │ Query Data         │
      │                    │                    ├───────────────────►│
      │                    │                    │◄───────────────────┤
      │                    │ 200 OK             │                    │
      │                    │◄───────────────────┤                    │
      │                    │ {dashboard_data}   │                    │
      │  Display Data      │                    │                    │
      │◄───────────────────┤                    │                    │


╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                     DATA FLOW ARCHITECTURE                                     ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝


    User Input                API Processing              Data Storage
         │                          │                          │
         ▼                          ▼                          ▼
    ┌─────────────┐          ┌──────────────┐         ┌─────────────┐
    │ Form Data   │─────────►│ Validation   │────────►│ Database    │
    │             │          │ • Schema     │         │             │
    │ • Username  │          │ • Types      │         │ • INSERT    │
    │ • Email     │          │ • Business   │         │ • SELECT    │
    │ • Password  │          │   Rules      │         │ • UPDATE    │
    └─────────────┘          └──────────────┘         │ • DELETE    │
                                  │                   └─────────────┘
                                  ▼
                          ┌──────────────┐
                          │ Processing   │
                          │ • Hash pwd   │
                          │ • Gen token  │
                          │ • Query data │
                          └──────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │ Response     │
                          │ • User data  │
                          │ • Token      │
                          │ • Status     │
                          └──────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │ Frontend     │
                          │ • Update UI  │
                          │ • Store data │
                          │ • Show toast │
                          └──────────────┘


╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                    API ENDPOINTS STRUCTURE                                     ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝

    ROOT: /
    ├── /auth                    [Authentication]
    │   ├── POST /register       → Create new user
    │   ├── POST /login          → Get JWT token
    │   └── POST /logout         → Invalidate session
    │
    ├── /profile                 [User Profiles]
    │   ├── POST /               → Create profile
    │   ├── GET /{user_id}       → Get profile
    │   └── PUT /{user_id}       → Update profile
    │
    ├── /research                [Research Papers]
    │   ├── GET /search          → Query OpenAlex API
    │   └── GET /saved           → Get saved papers
    │
    ├── /funding                 [Funding Search]
    │   └── GET /                → Search funding (CSV)
    │
    ├── /patents                 [Patent Search]
    │   └── GET /                → Search patents (CSV)
    │
    ├── /dashboard               [Dashboard]
    │   └── GET /{user_id}       → Get dashboard data
    │
    └── /health                  [Health Check]
        └── GET /                → API status


╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                            DEPLOYMENT ORCHESTRATION (Docker Compose)                          ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝

                          docker-compose.yml
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
        ┌───────▼─────────┐            ┌───────────▼──────────┐
        │  Backend Service│            │ Frontend Service     │
        │                 │            │                      │
        │ • Build: ./     │            │ • Build: ./frontend  │
        │ • Dockerfile.dev│            │ • Dockerfile.frontend│
        │ • Port: 8000    │            │ • Port: 5173         │
        │ • Reload: true  │            │ • Host mode          │
        │ • DB: SQLite    │            │ • deps: backend      │
        │ • Network: -┐   │            │ • Network: -┐        │
        └────────┬────┘   │            └──────┬──────┘         │
                 │ ai-research              │  ai-research     │
                 └─────────┬──────────────────┘                 │
                           │                                    │
                    ┌──────▼─────────┐                         │
                    │  Shared Network │                         │
                    │  ai-research    │                         │
                    └─────────────────┘                         │


╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                      MODULE DEPENDENCIES                                       ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝

                            main.py
                        (FastAPI App)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    auth/              profile/              research/
    • router.py        • router.py           • router.py
    • schemas.py       • schemas.py          • openalex.py
    • utils.py
        │                   │                     │
        └───────┬───────────┴─────────┬───────────┘
                │                     │
        ┌───────▼──────────┐  ┌──────▼──────────┐
        │   database/      │  │  funding/      │
        │  • db.py         │  │ • loader.py    │
        │  • models.py     │  │                │
        └────────┬─────────┘  │ patents/       │
                 │            │ • loader.py    │
                 │            └────────────────┘
                 │
        ┌────────▼──────────┐
        │   dashboard/      │
        │  • router.py      │
        └───────────────────┘


╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                     TECHNOLOGY STACK                                           ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝

    FRONTEND                        BACKEND                      DATABASE
    ┌──────────────────┐           ┌──────────────────┐         ┌──────────────┐
    │ React 19         │           │ FastAPI          │         │ SQLite 3     │
    │ Vite             │           │ Python 3.11      │         │ SQLAlchemy   │
    │ React Router 7   │           │ Uvicorn          │         │              │
    │ Axios            │           │ Pydantic         │         └──────────────┘
    │ Tailwind CSS     │           │ bcrypt           │
    │ Lucide Icons     │           │ python-jose      │         EXTERNAL APIs
    │ react-hot-toast  │           │ requests         │         ┌──────────────┐
    └──────────────────┘           │ pandas           │         │ OpenAlex     │
                                    └──────────────────┘         │ CSV Files    │
    TESTING                                                      └──────────────┘
    ┌──────────────────┐           ┌──────────────────┐
    │ Vitest           │           │ pytest           │
    │ @testing-library │           │ pytest-cov       │
    └──────────────────┘           │ pytest-asyncio   │
                                    │ httpx            │
                                    └──────────────────┘

    DEPLOYMENT
    ┌──────────────────┐
    │ Docker           │
    │ Docker Compose   │
    │ GitHub Actions   │
    └──────────────────┘


╔═════════════════════════════════════════════════════════════════════════════════════════════════╗
║                              QUICK REFERENCE - KEY PORTS & URLS                               ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝

    ┌─────────────────────────────────────────────────┐
    │ DEVELOPMENT ENVIRONMENT                         │
    ├─────────────────────────────────────────────────┤
    │ Frontend:      http://localhost:5173            │
    │ Backend:       http://127.0.0.1:8000            │
    │ API Docs:      http://127.0.0.1:8000/docs       │
    │ ReDoc:         http://127.0.0.1:8000/redoc      │
    │ Database:      research_platform.db (local)     │
    └─────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────┐
    │ KEY FILES                                       │
    ├─────────────────────────────────────────────────┤
    │ Start:    start-dev.bat (Windows)               │
    │           start-dev.sh (Unix/Mac)               │
    │ Verify:   python verify.py                      │
    │ Test:     pytest backend/tests/                 │
    │           npm run test (frontend)               │
    │ Deploy:   docker-compose up                     │
    └─────────────────────────────────────────────────┘
```

---

## 📊 Architecture Overview

This diagram shows the complete system architecture with:

✅ **Frontend Layer** - React UI with Vite and routing  
✅ **Backend Layer** - FastAPI with 6 modules and 20+ endpoints  
✅ **Data Layer** - SQLite database with SQLAlchemy ORM  
✅ **External Integrations** - OpenAlex API and CSV data files  
✅ **Testing** - Comprehensive pytest and vitest infrastructure  
✅ **Deployment** - Docker containerization and CI/CD pipeline  
✅ **Security** - JWT authentication and CORS middleware  

**Key Features:**
- Full request-response cycle shown
- Authentication flow diagram
- Data flow architecture
- API endpoint structure
- Deployment orchestration
- Technology stack breakdown

All components are integrated and production-ready! 🚀
