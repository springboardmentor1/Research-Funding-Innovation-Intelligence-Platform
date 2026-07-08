# Research Funding & Innovation Intelligence Platform

An AI-powered intelligence platform designed to help researchers, startups, universities, innovation managers, and administrators discover global funding opportunities, analyze scientific publications, evaluate patent landscapes, and calculate innovation standings.

---

## Project Overview
The platform provides intelligent tools to streamline academic and commercial innovation workflows. By integrating APIs like OpenAlex and The Lens, it constructs real-time portfolios mapping scientific trends, publication records, and intellectual property. The system uses a normalized relational database and security controls to manage identities and role-based access.

---

## Features
- **User Authentication & RBAC**: Secure JWT-based registration and login system with Role-Based Access Control (Researcher, Startup Founder, Innovation Manager, Administrator).
- **Research Profile Management**: Profile builder to configure research domains, keywords, designations, and sync with ORCID.
- **Publications Management (OpenAlex API)**: Search and synchronize scientific literature matching the user's research interests, with automated abstract reconstruction.
- **Patent Management (The Lens API)**: Monitor intellectual property landscapes, file statuses, CPC/IPC classifications, and competitor patent timelines.
- **Innovation Scoring & AI Recommendations (Milestone 2)**: Emergent algorithms to map collaborator profiles, recommend grant calls, and calculate innovation readiness.

---

## Technology Stack

### Backend
- **FastAPI**: Modern, high-performance web framework for Python.
- **SQLAlchemy & PostgreSQL**: Relational database ORM with robust transactions, indexing, and cascade rules.
- **Bcrypt & Python-Jose**: Native password hashing and JSON Web Tokens (JWT) handling.

### Frontend
- **React.js & Vite**: Fast build tool and single-page application framework.
- **Tailwind CSS v4**: Utility-first styling framework with modern Vite compiling plugins.
- **React Router DOM**: Client-side routing.

---

## Project Architecture
The platform is designed around a decoupled, modern three-tier web architecture:
- **Client Tier (Frontend)**: React.js SPA application styling via Tailwind CSS. Configures routing paths and layouts.
- **Application Tier (Backend)**: FastAPI application providing REST API endpoints. Utilizes SQLAlchemy ORM for relational queries, Pydantic for validation schemas, and JWT security.
- **Data Tier (Database)**: PostgreSQL database representing structured relations. Supported by indices on foreign keys, database triggers, and composite unique constraints.

---

## Folder Structure

```text
Research-Funding-Innovation-Intelligence-Platform/
│
├── backend/
│   ├── app/
│   │   ├── database/        # Connection managers
│   │   ├── models/          # SQLAlchemy Database Models
│   │   ├── routes/          # API Endpoints / Routers
│   │   ├── schemas/         # Pydantic Validation Schemas
│   │   ├── services/        # Business Logic Services
│   │   ├── utils/           # Security & JWT Helpers
│   │   └── main.py          # FastAPI application startup init
│   │
│   ├── requirements.txt     # Python Dependencies list
│   ├── verify_auth.py       # Authentication unit tests
│   ├── verify_profile.py    # Profile CRUD validation checks
│   ├── verify_publication.py# OpenAlex integration check
│   ├── verify_patent.py     # Patent retrieval test checks
│   └── verify_full_flow.py  # End-to-End integration test script
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Stylesheets, icons, and logos
│   │   ├── components/      # UI, Layout, and reusable parts
│   │   ├── pages/           # Dashboard and Auth views (Placeholders)
│   │   ├── routes/          # React Router configuration
│   │   ├── App.jsx          # Root view container
│   │   └── main.jsx         # App startup bootstrap
│   ├── package.json         # Frontend configuration
│   └── vite.config.js       # Vite configuration with Tailwind v4
│
├── database/
│   ├── schema.sql           # PostgreSQL database DDL schemas
│   └── schema_design.md     # Normalized Database ERD layout
│
├── docs/
│   ├── architecture/        # System design diagram PNG
│   ├── database/            # Database schema documentations
│   ├── ui_wireframes/       # UI flow map, navigation trees, and PNG wireframes
│   └── reports/             # Milestone progress reports (Milestone 1 Report)
│
├── README.md                # General introduction document
├── DEMO.md                  # Step-by-Step execution guide
└── .gitignore               # System ignore configuration
```

---

## Environment Variables
Create a `.env` file in the `backend/` directory based on the placeholders in [.env.example](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/backend/.env.example):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/research_funding
MONGODB_URI=mongodb://localhost:27017/logs
OPENALEX_BASE_URL=https://api.openalex.org
OPENALEX_API_KEY=your_openalex_premium_token
LENS_API_KEY=your_lens_api_token
JWT_SECRET_KEY=your_super_secret_jwt_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Installation Instructions

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set environment variables in `.env`.
5. Launch the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## API Endpoints

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login with Form Data (OAuth2 password flow)
- `POST /auth/login-json` - Login with JSON body
- `GET /auth/me` - Fetch logged-in user profile details
- `GET /auth/admin-only` - Restricted route for Admin testing

### Research Profile
- `POST /profile` - Create research profile (One-to-one per user)
- `GET /profile/me` - Fetch profile metadata
- `PUT /profile` - Update profile data fields
- `DELETE /profile` - Remove profile record

### Publications Management
- `GET /publications/search` - Query & sync papers from OpenAlex
- `GET /publications` - List synced papers (supports filters: domain, year, citations, keyword)
- `GET /publications/{id}` - Fetch single publication metadata

### Patent Management
- `GET /patents/search` - Query & sync patents from Lens API
- `GET /patents` - List synced patents (supports filters: tech_domain, year, status, inventor, keyword)
- `GET /patents/{id}` - Fetch single patent metadata

---

## Screenshots
*(Screenshots of dashboards, wireframes, and API docs will be updated in future releases)*

---

## Future Scope
- **AI Recommendation Engine**: Build machine learning models to suggest collaborator matchmaking and grant funding calls.
- **Innovation Indexing**: Implement automated scoring services evaluating citation count velocity and IP patent filings.
- **Frontend Dashboard Integration**: Implement dashboard panels rendering metric graphs, citation charts, and matching grant proposals.

---

## Contributors
- **Dr. Sarah Connor** - Principal Investigator
- **Antigravity** - AI Engineering Partner
