# Production Deployment Guide (Milestone 4)

## Overview
This document provides step-by-step instructions to deploy the **Research Funding & Innovation Intelligence Platform** using Docker, Docker Compose, and production cloud services (AWS EC2/ECS, GCP Compute Engine, Azure Container Instances).

---

## 1. Architecture Overview

```text
                    ┌──────────────────┐
                    │   React + Nginx  │
                    │    Frontend      │
                    │   Port 5173:80   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     FastAPI      │
                    │     Backend      │
                    │    Port 8000     │
                    └───────┬───┬──────┘
                            │   │
              ┌─────────────┘   └─────────────┐
              ▼                               ▼
      ┌────────────────┐             ┌────────────────┐
      │  PostgreSQL    │             │    Reports     │
      │    Database    │             │   (Generated)  │
      │   Port 5432    │             │  Disk Storage  │
      └────────────────┘             └────────────────┘
```

---

## 2. Prerequisites
- **Docker Engine**: v20.10+
- **Docker Compose**: v2.0+
- **Git**
- **Domain & SSL Certificate** (for HTTPS in cloud production)

---

## 3. Environment Configuration
Create a production `.env` file in the project root:

```env
POSTGRES_USER=prod_admin
POSTGRES_PASSWORD=SecurePassword_2026!
POSTGRES_DB=research_platform_prod
JWT_SECRET_KEY=9f8e7d6c5b4a3210fedcba9876543210
ACCESS_TOKEN_EXPIRE_MINUTES=60
VITE_API_BASE_URL=http://your-domain.com:8000
```

---

## 4. Local & Production Docker Compose Launch

### Step 1: Build Container Stack
```bash
docker-compose build
```

### Step 2: Launch Service Cluster in Background
```bash
docker-compose up -d
```

### Step 3: Check Container Health
```bash
docker-compose ps
```

Expected output:
- `platform_postgres`: Healthy (Port 5432)
- `platform_mongodb`: Up (Port 27017)
- `platform_backend`: Up (Port 8000)
- `platform_frontend`: Up (Port 5173 -> 80)

---

## 5. Cloud Platform Deployment (AWS EC2 / GCP / Azure)

1. Provision a Virtual Machine (Ubuntu 22.04 LTS, 4GB RAM minimum).
2. Clone the repository:
   ```bash
   git clone https://github.com/springboardmentor1/Research-Funding-Innovation-Intelligence-Platform.git
   cd Research-Funding-Innovation-Intelligence-Platform
   ```
3. Set environment variables in `.env`.
4. Launch with Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
5. Configure reverse proxy (Nginx / Certbot for SSL HTTPS):
   ```bash
   sudo certbot --nginx -d platform.yourdomain.com
   ```

---

## 6. Maintenance & Backup
- **PostgreSQL Backup**:
  ```bash
  docker exec -t platform_postgres pg_dump -U postgres research_platform > backup_$(date +%F).sql
  ```
- **View Backend Logs**:
  ```bash
  docker logs -f platform_backend
  ```
