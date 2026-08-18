# Deployment Guide

## Research Funding & Innovation Intelligence Platform

This guide covers local development, Docker deployment, and cloud deployment options.

---

## 1. Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- npm 10+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/macOS)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp ../.env.example .env
# Edit .env with your settings

# Start the backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Ensure VITE_API_URL=http://localhost:8000

# Start the development server
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 2. Docker Deployment (Recommended)

### Prerequisites
- Docker 24+
- Docker Compose v2+

### Architecture

```
              Docker Compose
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
   Frontend      Backend     Database
   React+Nginx   FastAPI    PostgreSQL
   Port 5173     Port 8000   Port 5432
```

### Quick Start

```bash
# Build and start all services
docker compose build
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove volumes (resets database)
docker compose down -v
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://rfiip:rfiip_secret@db:5432/research_platform
POSTGRES_USER=rfiip
POSTGRES_PASSWORD=rfiip_secret
POSTGRES_DB=research_platform

# Authentication
SECRET_KEY=your_production_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Frontend
VITE_API_URL=http://localhost:8000
```

> **Important**: Change `SECRET_KEY` and `POSTGRES_PASSWORD` to strong, unique values in production.

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost:5173

# PostgreSQL health
docker compose exec db pg_isready -U rfiip
```

### Verification

After `docker compose up`:
1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:8000
3. **Swagger Docs**: http://localhost:8000/docs
4. Register a new user and walk through the entire workflow

---

## 3. Cloud Deployment

### Option A: Railway (Easiest)

Railway provides one-click deployment with Docker support.

1. **Push code to GitHub**
2. **Create Railway project**: https://railway.app
3. **Add services**:
   - PostgreSQL database (Railway plugin)
   - Backend service (from Dockerfile)
   - Frontend service (from Dockerfile)
4. **Configure environment variables** in Railway dashboard
5. **Set custom domains** for frontend and backend

### Option B: AWS (EC2 + RDS)

1. **Database**: Create an RDS PostgreSQL instance
2. **Backend**: Deploy to EC2 or ECS with the backend Dockerfile
3. **Frontend**: Deploy to S3 + CloudFront (static hosting)
4. **Configuration**:
   ```env
   DATABASE_URL=postgresql://user:pass@your-rds-endpoint:5432/research_platform
   SECRET_KEY=your_production_secret
   ```

### Option C: Azure (App Service)

1. **Database**: Create Azure Database for PostgreSQL
2. **Backend**: Deploy to Azure App Service (Docker container)
3. **Frontend**: Deploy to Azure Static Web Apps
4. **Configuration**: Set environment variables in App Service settings

### Option D: Render (Free Tier)

1. **Database**: Create a PostgreSQL database on Render
2. **Backend**: Create a new Web Service -> Docker -> connect to GitHub
3. **Frontend**: Create a Static Site -> connect to GitHub
4. **Environment**: Set `DATABASE_URL`, `SECRET_KEY` in Render dashboard

---

## 4. Production Checklist

Before deploying to production, ensure:

- [ ] `SECRET_KEY` is a strong, unique value (32+ characters)
- [ ] `POSTGRES_PASSWORD` is a strong, unique value
- [ ] CORS origins are restricted (not `*`)
- [ ] HTTPS is configured (SSL/TLS certificates)
- [ ] Database backups are configured
- [ ] `.env` file is NOT committed to version control
- [ ] Frontend `VITE_API_URL` points to production backend URL
- [ ] Health check endpoints are accessible

### Updating Production Frontend API URL

When deploying to production, update the frontend API URL:

```bash
# In frontend/.env or build environment
VITE_API_URL=https://your-production-backend-url.com
```

Then rebuild the frontend:
```bash
cd frontend
npm run build
```

---

## 5. Database Management

### SQLite (Development)
- Database file: `backend/research_platform.db`
- No additional setup needed
- Tables auto-created on startup

### PostgreSQL (Production)
- Connection via `DATABASE_URL` environment variable
- Tables auto-created by SQLAlchemy on startup
- Use `pg_dump` for backups:
  ```bash
  docker compose exec db pg_dump -U rfiip research_platform > backup.sql
  ```
- Restore from backup:
  ```bash
  docker compose exec -T db psql -U rfiip research_platform < backup.sql
  ```

---

## 6. Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `allow_origins` in `main.py` |
| Database connection failed | Verify `DATABASE_URL` and database service health |
| Frontend can't reach backend | Check `VITE_API_URL` and network configuration |
| Docker build fails | Run `docker compose build --no-cache` |
| Port already in use | Change port mapping in `docker-compose.yml` |
| PostgreSQL connection refused | Wait for health check to pass, check credentials |
