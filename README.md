# Research Funding & Innovation Intelligence Platform

An enterprise AI-powered intelligence platform designed to help researchers, startups, universities, innovation managers, and administrators discover global funding opportunities, analyze scientific publications, evaluate patent landscapes, calculate innovation standings, export executive reports, and deploy using production Docker micro-services.

---

## Features (Milestones 1–4)

- **User Authentication & Role-Based Access Control (RBAC)**: Secure JWT-based registration and login system for Researchers, Startup Founders, Innovation Managers, and Administrators.
- **Research Profile Builder**: Establish research domains, keywords, designations, and sync credentials.
- **Publications Intelligence (OpenAlex API)**: Search and synchronize scientific literature matching research domains with inverted abstract reconstruction.
- **Patent Landscape Engine (The Lens API)**: Intellectual property landscape monitoring, legal statuses, CPC/IPC classification breakdown, and competitor watch.
- **AI Funding Alignment Engine**: Match capital grant opportunities ($5.15B pool) with match % scores and deadline tracking.
- **Innovation Scoring & Commercialization Matrix**: Patent growth rate, citation velocity, Technology Readiness Level (TRL 1-9), and commercial readiness radar.
- **Role-Tailored Executive Dashboards (Milestone 4)**: Specialized executive dashboards for Administrator (health & audit logs), Innovation Manager (TTO pipeline & royalties), Researcher (bibliometrics & collaborators), and Startup Founder (TRL & competitor IP).
- **Enterprise Reports Engine (Milestone 4)**: Dedicated report storage (`backend/reports/generated/`) with multi-format PDF, CSV, and JSON export capabilities.
- **Automated Test & Verification Suite**: Pytest backend suite (8/8 passed), Vitest frontend suite (19/19 passed), and `verify_milestone4_full_flow.py` master verification.
- **Production Containerization**: Multi-container Docker setup (`Dockerfile` for FastAPI, `Dockerfile` & `nginx.conf` for React, and `docker-compose.yml`).

---

## Technology Stack

### Backend
- **FastAPI**: Modern, high-performance web framework for Python.
- **SQLAlchemy & PostgreSQL**: Relational database ORM with robust transactions, indexing, and cascade rules.
- **Bcrypt & Python-Jose**: Native password hashing and JSON Web Tokens (JWT) handling.
- **Pytest**: Automated unit and integration testing framework.

### Frontend
- **React.js & Vite**: Fast build tool and single-page application framework.
- **Tailwind CSS v4**: Utility-first styling framework with modern Vite plugins.
- **Recharts**: Data visualization library for Area, Bar, Pie, and Radar charts.
- **Vitest & React Testing Library**: Component unit testing suite.

### Infrastructure & Containerization
- **Docker & Docker Compose**: Containerized microservices stack.
- **Nginx**: Web server for React SPA routing and backend API proxying.

---

## Folder Structure

```text
Research-Funding-Innovation-Intelligence-Platform/
│
├── backend/
│   ├── app/
│   │   ├── database/        # Connection managers
│   │   ├── models/          # SQLAlchemy Database Models
│   │   ├── routes/          # API Routers (auth, profile, publication, patent, dashboard, funding, innovation, executive, reports)
│   │   ├── schemas/         # Pydantic Validation Schemas
│   │   ├── services/        # Business Logic Services
│   │   └── main.py          # FastAPI application startup init
│   ├── reports/
│   │   ├── generated/       # Rendered PDF, CSV, JSON report files
│   │   └── templates/       # Report header/footer layout templates
│   ├── tests/               # Pytest suite (test_auth.py, test_executive_dashboards.py, test_reports.py)
│   ├── Dockerfile           # Backend container image
│   └── verify_milestone4_full_flow.py  # E2E Master Verification script
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable visual chart & layout components
│   │   ├── pages/           # Executive & unified dashboards (Admin, Manager, Researcher, Startup, Reports)
│   │   ├── routes/          # React Router configuration
│   │   └── tests/           # Vitest frontend suite
│   ├── Dockerfile           # Multi-stage React/Nginx Dockerfile
│   └── nginx.conf           # Production Nginx web server configuration
│
├── docs/
│   ├── deployment_guide.md  # Docker & Cloud deployment guide
│   ├── executive_dashboard.md # Executive APIs documentation
│   ├── reports_module.md    # Reports engine & storage documentation
│   ├── presentation.md      # Final deck script & outline
│   └── reports/             # Progress reports (milestone_4_report.md)
│
├── docker-compose.yml       # Production microservices orchestration
├── README.md                # General introduction document
└── DEMO.md                  # Step-by-step execution guide
```

---

## Quick Start with Docker Compose

To launch the complete production stack (PostgreSQL, MongoDB, FastAPI Backend, React Frontend):

```bash
# 1. Build container images
docker-compose build

# 2. Launch container stack in background
docker-compose up -d

# 3. Access applications:
# Frontend: http://localhost:5173
# API Documentation: http://localhost:8000/docs
```

---

## Testing & Verification Commands

### Run Backend Pytest Suite
```bash
cd backend
pytest
```

### Run Backend End-to-End Verification Script
```bash
python backend/verify_milestone4_full_flow.py
```

### Run Frontend Vitest Suite
```bash
cd frontend
npm test
```

---

## Contributors
- **Dr. Sarah Connor** - Principal Investigator
