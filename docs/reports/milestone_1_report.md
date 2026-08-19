# Milestone 1 Report - Research Funding & Innovation Intelligence Platform
**Milestone**: Milestone 1 Completion Report  
**Date**: July 8, 2026  

---

## 1. Introduction
The **Research Funding & Innovation Intelligence Platform** is an AI-powered intelligence platform designed to help researchers, startups, universities, innovation managers, and administrators discover global funding opportunities, analyze scientific publications, evaluate patent landscapes, assess technology readiness levels (TRL), and calculate innovation standings. 

This report details the work completed for **Milestone 1**, which covers baseline system design, database architecture, UI wireframes, frontend scaffolding, and core backend API module implementations (Authentication, Research Profiles, Publications, and Patents).

---

## 2. Objectives
The primary objectives of Milestone 1 were:
1. Establish a scalable database schema supporting authentication, profiles, grants, publications, patents, innovation metrics, and recommendations.
2. Design responsive dashboard interfaces and compile low-fidelity wireframe mockups.
3. Scaffold the frontend application framework using Vite, React.js, Tailwind CSS, and configure routing pipelines.
4. Develop the backend API services using FastAPI and integrate authentication controls (JWT + bcrypt).
5. Implement CRUD operations for Research Profiles.
6. Connect external APIs (OpenAlex for publications, Lens API/mock fallback for patents) to query and store research intellectual data.
7. Conduct automated unit and integration flow testing to verify correctness.

---

## 3. System Architecture
The platform is designed around a decoupled, modern three-tier web architecture:
- **Client Tier (Frontend)**: React.js application bundled using Vite, incorporating Tailwind CSS v4 and React Router DOM. Exposes responsive layouts with collapsible sidebars and metric dashboards.
- **Application Tier (Backend)**: FastAPI application providing REST API endpoints. Utilizes SQLAlchemy ORM for relational queries, Pydantic for validation schemas, python-jose for JWT security, and native bcrypt for password encryption.
- **Data Tier (Database)**: PostgreSQL database representing structured relations. Supported by indices on foreign keys and search criteria, database triggers for change tracking, and unique constraints for deduplication.

---

## 4. Database Design
A normalized, modular PostgreSQL database schema was successfully designed and documented in [database_schema.md](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/docs/database/database_schema.md) and written in [schema.sql](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/database/schema.sql).
The schema is partitioned into 7 distinct modules:
- User Authentication (users, roles, user_roles)
- Profile Management (institutions, research_profiles, interests)
- Funding Opportunities (funding_agencies, funding_opportunities)
- Publication Management (publications, publication_authors)
- Patent Management (patents, patent_inventors)
- Innovation Scoring (innovation_scores - supporting Polymorphic check constraints)
- AI Recommendations (ai_recommendations - supporting targeted reference checks)

---

## 5. UI Wireframes
Responsive, low-fidelity wireframe mockups representing the major platform layout workflows were created and organized in `docs/ui_wireframes/`.
- [ui_wireframes.md](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/docs/ui_wireframes/ui_wireframes.md) maps the **User Flow Diagram** and **Sidebar Navigation Map** using Mermaid.
- Visually maps out:
  - [login_page.png](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/docs/ui_wireframes/login_page.png) (Authentication split layout)
  - [researcher_dashboard.png](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/docs/ui_wireframes/researcher_dashboard.png) (Metrics, citation history, and grant matches)
  - [funding_page.png](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/docs/ui_wireframes/funding_page.png) (Advanced filter sidebar and matching results)
  - [patent_page.png](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/docs/ui_wireframes/patent_page.png) (Heatmaps and competitors tracking)
  - [admin_dashboard.png](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/docs/ui_wireframes/admin_dashboard.png) (Audits and system cron logs)

---

## 6. Backend Setup
The backend environment is established inside the `backend/` folder:
- Active Python virtual environment (`venv`).
- Complete packages list defined in `requirements.txt`.
- Start commands configured with Uvicorn dev server mapping `app.main:app`.
- Successfully validated backend boot-up and import operations.

---

## 7. Frontend Setup
The frontend environment is scaffolded in the `frontend/` folder:
- **Scaffold**: React 19 + Vite 8.
- **Packages Installed**: `react-router-dom`, `axios`, `react-icons`.
- **CSS Framework**: Tailwind CSS v4 configured natively via the `@tailwindcss/vite` plugin.
- **Directory Structure**: Folders constructed contextually for components, routes, context, assets, and pages.
- **Build Status**: Verified via production compiler build (`npm run build`) which compiled index bundles in 222ms with zero warnings.

---

## 8. Authentication
The authentication subsystem implements secure registration and login using JWT.
- **Endpoints**: `POST /auth/register`, `POST /auth/login` (Swagger OAuth2 compliant), `POST /auth/login-json`, `GET /auth/me`.
- **Encryption**: Utilizes native `bcrypt` library to encrypt password strings, storing securely as `hashed_password` in the DB.
- **Authorization**: Validates claims from the token using `python-jose` and provides Role-Based Access Control (RBAC) via the `RoleChecker` dependency factory, enabling route-level guards like `GET /auth/admin-only`.

---

## 9. Research Profile Module
The profile manager allows users to maintain their academic standings.
- **Endpoints**: `POST /profile` (create), `GET /profile/me` (read), `PUT /profile` (update), `DELETE /profile` (delete).
- **CRUD Operations**: Enforces unique, one-to-one user-to-profile bindings, preventing duplicate creations.
- **Pydantic Validation**: Validates constraints such as positive citations, publication counts, and years of experience.

---

## 10. Publication Integration
The publication module interfaces with the **OpenAlex REST API** (`api.openalex.org`).
- **Synchronisation**: `GET /publications/search` fetches up to 100 works dynamically matching the authenticated user's profile domain and keywords.
- **Reconstruction**: Implements an abstract reconstruction algorithm to process OpenAlex's inverted index format into human-readable text.
- **Composite Deduping**: Uses a composite unique constraint `UniqueConstraint('user_id', 'openalex_id')` to support co-authors importing overlapping papers without database collisions.
- **Advanced Querying**: Implements SQL joins to filter saved papers by "Research Domain", "Publication Year", and citation counts.

---

## 11. Patent Integration
The patent module interfaces with **The Lens API** (`api.lens.org/patent/search`).
- **API Connectivity**: Executes POST queries containing payload sorting options.
- **Robust Fallback**: Implements a dynamic mock generator that compiles realistic datasets based on user research subdomains and tech interests if Lens API keys are absent or requests timeout.
- **Advanced Filtering**: Enables filters for tech domain, filing year (using `extract('year', ...)`), status (GRANTED/FILED), and inventor/title keywords.

---

## 12. Testing & Verification
We developed three verification suites using FastAPI `TestClient` and an in-memory SQLite database:
1. `verify_auth.py`: Checked register, login, token receipt, and RBAC restrictions. (100% PASS)
2. `verify_profile.py`: Checked profile creation, profile retrieval, updates, duplicates block, and deletions. (100% PASS)
3. `verify_publication.py` & `verify_patent.py`: Validated external API parsing, unique deduping, and query parameter filtering. (100% PASS)
4. [verify_full_flow.py](file:///c:/Users/Admin/OneDrive/Desktop/ATM/Research-Funding-Innovation-Intelligence-Platform/backend/verify_full_flow.py): Executed the complete user sequence (Register $\rightarrow$ Login $\rightarrow$ Profile Create $\rightarrow$ Publications Search $\rightarrow$ View Pubs $\rightarrow$ Patents Search $\rightarrow$ View Patents). All 7 steps passed cleanly.

---

## 13. Challenges Faced
- **Passlib Bcrypt Compatibility**: Encountered a well-known `ValueError: password cannot be longer than 72 bytes` bug in `passlib` under Python 3.10+ due to self-tests on newer bcrypt versions. Resolving this required bypassing passlib and implementing native hashing/checking via the `bcrypt` library directly.
- **Unicode Terminal Output**: Checkmark emoji symbols crashed verification scripts when run in default Windows consoles (CP1252 character maps). Fixed by replacing emojis with ASCII `[OK]` and `[FAIL]` tags.
- **OpenAlex Abstract Formatting**: Handling inverted token index mappings to rebuild abstracts required writing a position-sorted list reconstruction routine.
- **PostgreSQL Local Verification**: To enable verification checks inside the sandbox without demanding a local PostgreSQL server, the database engine config was updated to automatically route connections to SQLite whenever `DATABASE_URL` is set to a SQLite string, ensuring immediate testing portability.

---

## 14. Conclusion
All objectives outlined for **Milestone 1** of the Research Funding & Innovation Intelligence Platform have been achieved. The project has a normalized database schema, clear visual UI wireframes, a scaffolded frontend, and a fully functional and verified backend API suite. The workspace is organized, documented, and ready to proceed to Milestone 2 (Frontend Dashboard implementation and API integration).
