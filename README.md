# AI-Powered Research Funding & Innovation Intelligence Platform

A complete, production-grade web platform connecting researchers, startup founders, innovation managers, and system administrators to open-access research papers, federal & institutional grant recommendations, USPTO patent prior-art analysis, emerging technology indicators, explainable innovation scoring, commercialization pathways, and AI assistance.

---

## 🌟 Key Modules & Features

1. **Authentication & User Management**:
   - **Login Page (`/login`) as the required starting page**.
   - Role-Based Access Control (`Researcher`, `Startup Founder`, `Innovation Manager`, `Administrator`).
   - Passlib `bcrypt` password hashing & PyJWT token management.

2. **Research Profile Management**:
   - Personalized research interests, domains, keywords, and publication history.

3. **Research Data Collection & Preprocessing**:
   - OpenAlex API downloader script (`scripts/download/download_openalex.py`) with rate limiters and error retries.
   - Preprocessing script (`scripts/preprocess/clean_openalex.py`) generating cleaned JSON and CSV datasets.

4. **Research Discovery & Trend Intelligence**:
   - Title, abstract, domain, citation, and year filtering.
   - Annual publication velocity line charts and topic frequency bar charts using Chart.js.

5. **AI Funding Recommendation Engine**:
   - `SentenceTransformers` (`all-MiniLM-L6-v2`) embeddings semantic cosine similarity ranking user profile keywords against active grant eligibility.
   - Clear relevance score percentages (%) and detailed match rationales.

6. **Patent Intelligence & Clustering**:
   - USPTO patent search, CPC classifications, assignees, and vector similarity clustering against research proposals.

7. **Emerging Technology Matrix**:
   - Cross-disciplinary signal aggregation combining paper count, patent filings, and grant pools.

8. **Explainable Innovation Scoring Engine**:
   - 5-factor weighted model:
     $$\text{Score} = 30\% \text{ Novelty} + 20\% \text{ Patent} + 15\% \text{ Tech} + 20\% \text{ Market} + 15\% \text{ Funding}$$
   - Radar charts, risk factors, and strengths breakdown.

9. **Commercialization Pathways**:
   - IP licensing opportunities, university spin-off guidance, and SBIR/STTR grant recommendations.

10. **Platform AI Research Assistant**:
    - Context-aware chatbot querying active SQL database records for grants, papers, and patents.

11. **Reports & Exports**:
    - One-click PDF (ReportLab) and Excel (Pandas/OpenPyXL) report generators.

---

## 🚀 Quick Start Guide

### 1. Database Seeding & Setup
```bash
# Navigate to project root
cd C:\Users\damar\.gemini\antigravity-ide\scratch\ai-research-funding-platform

# Install Python dependencies
cd backend
pip install -r requirements.txt

# Run database seeder (populates SQLite/PostgreSQL with users, papers, grants, patents)
cd ..
python scripts/load/seed_database.py
```

### 2. Launch FastAPI Backend
```bash
cd backend
python app/main.py
# Backend API running at http://localhost:8000 (OpenAPI Docs at http://localhost:8000/docs)
```

### 3. Launch React Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:3000
```

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
|---|---|---|
| **Researcher** | `researcher@platform.org` | `password123` |
| **Startup Founder** | `founder@platform.org` | `password123` |
| **Innovation Manager** | `manager@platform.org` | `password123` |
| **Administrator** | `admin@platform.org` | `admin123` |

---

## 🐳 Docker Deployment
```bash
docker-compose up --build
```
