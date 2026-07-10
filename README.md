# Research Funding & Innovation Intelligence Platform

A full-stack application to ingest publication trends, researcher profiles, organization data, funding opportunities, and patents; with a frontend dashboard to visualize insights!

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy (SQLite), Pydantic
- **Frontend**: React, Vite, TanStack Query & Router, Shadcn UI
- **Data Collectors**: OpenAlex, ORCID, ROR, PatentsView, Grants.gov

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy/Create the `.env` configuration file from the template:
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

4. Initialize the database (creates tables and default admin user):
   ```bash
   python seed.py
   ```
   Default admin credentials:
   - Email: `admin@example.com`
   - Password: `password123`

5. Run the backend server (with hot reload):
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   - API docs will be available at http://localhost:8000/docs

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install required dependencies:
   ```bash
   npm install
   ```

3. Run the frontend development server (with hot reload):
   ```bash
   npm run dev
   ```
   - The frontend will be available at http://localhost:8080/

## Running the Data Collectors

You can run the collectors from the project root:

- **Run Ingestion Pipeline (all collectors):**
  ```bash
  python cli.py collect --limit 3 --query "quantum computing"
  ```

- **Run Specific Collector (e.g. OpenAlex only):**
  ```bash
  python cli.py collect --collector openalex --limit 5 --query "bioinformatics"
  ```

- **Inspect DB Row Counts:**
  ```bash
  python cli.py stats
  ```

- **Export Stored DB Tables to Parquet/CSV:**
  ```bash
  python cli.py export
  ```

## Running Tests
Execute backend tests using pytest:
```bash
cd backend
python -m pytest tests/
```

## Key Features (v1.0)
✅ No mock data – all data comes from real APIs (or your database)
✅ Admin-only user management (view all registered users)
✅ Dashboard with real stats from your database
✅ Clean, modern frontend with Shadcn UI components
✅ Role-based authentication (JWT)
