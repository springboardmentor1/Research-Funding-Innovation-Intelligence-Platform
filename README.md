# Funding & Innovation Intelligence Platform (v2: Real Data Edition)

A full-stack web application designed to track and analyze academic research, national funding grants, and commercial patent assets using real, live public APIs.

---

## 🚀 Getting Started

Follow these steps to run the application locally on Windows.

### 1. Ingest Data to SQLite
Run the ingestion pipeline to fetch 120 publications and grants from OpenAlex, and 15 patents from USPTO ODP:
```powershell
cd backend
.\venv\Scripts\Activate
python -m ingestion.seed_raw_cache
python -m ingestion.load_to_db
```
*Note: If public APIs are unreachable or API keys are missing, the pipeline gracefully falls back to the pre-populated raw JSON caches located in `data/raw/`.*

### 2. Run the FastAPI Backend
Start the FastAPI server on port 8000:
```powershell
uvicorn main:app --reload
```

### 3. Run the React Frontend
Open a new shell and start the Vite development server:
```powershell
cd frontend
npm install
npm run dev
```

### 4. Run the Jupyter Notebook
Open the exploratory data analysis notebook to view the charts and takeaways:
```powershell
cd notebooks
jupyter notebook eda.ipynb
```

---

## 📂 Project Structure

- `backend/`: FastAPI backend containing routers, SQLAlchemy database configurations, business logic, clients, and schemas.
- `frontend/`: Vite-based React frontend containing Login, Register, Profile, and Datasets list pages styled under a premium dark glassmorphism theme.
- `data/`: Ingestion caches (`data/raw/`) and cleaned CSVs (`data/processed/`) for exploratory data analysis.
- `notebooks/`: Exploratory Data Analysis (EDA) notebook plotting trends and domain correlations.
- `docs/`: Technical and architectural documentation.

---

## 🔑 Environment Variables

API keys should be stored in `backend/.env`. Commit only `backend/.env.example`.

```env
SECRET_KEY=antigravity-super-secret-jwt-key
DATABASE_URL=sqlite:///./innovation_platform.db
OPENALEX_API_KEY=your_openalex_api_key
USPTO_ODP_API_KEY=your_uspto_api_key
```
