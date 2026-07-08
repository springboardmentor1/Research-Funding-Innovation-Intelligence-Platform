# System Architecture: Research Funding & Innovation Intelligence Platform

## Overview
This document outlines the foundational architecture for the platform. The system is designed using a microservices-style architecture, though for Milestone 1, it will be deployed as a single FastAPI backend service for simplicity and speed of iteration.

## System Components

### 1. Presentation Layer (Frontend)
- **Technology:** React.js (Vite), JavaScript/TypeScript.
- **Responsibility:** User Interface, rendering dashboards, handling user input (forms), communicating with the backend API via HTTP.
- **Routing:** Client-side routing to manage distinct views (Login, Dashboards, Profile Editor).

### 2. Application Layer (Backend API)
- **Technology:** Python, FastAPI.
- **Responsibility:** Handling business logic, authentication/authorization (JWT, OAuth2), data validation (Pydantic), and database interactions.
- **Key Modules:**
  - `api`: FastAPI route handlers (endpoints).
  - `core`: Security, JWT configuration, environment variables.
  - `services`: Business logic (e.g., Profile management).
  - `db`: Database connection pooling and session management.
  - `models`: SQLAlchemy (PostgreSQL) and Motor (MongoDB) models/schemas.

### 3. Data Layer (Databases)
The system employs a polyglot persistence strategy to handle different types of data efficiently.

#### 3.1 Relational Database (PostgreSQL)
- **Purpose:** Storing structured, relational data with strong ACID guarantees.
- **Data Stored:** 
  - Users and Authentication (Credentials, OAuth links).
  - Roles and Permissions (RBAC).
  - User Sessions / Refresh Tokens.
  - Core Research Profiles (Keywords, Demographics).

#### 3.2 Document Database (MongoDB)
- **Purpose:** Storing semi-structured or unstructured data ingested from diverse external sources with varying schemas.
- **Data Stored:**
  - `publications`: Data from OpenAlex (Titles, abstracts, authors, concepts).
  - `patents`: Data from USPTO PatentsView (Patent IDs, assignees, classifications).

### 4. Background Processes (Data Ingestion)
- **Technology:** Python scripts.
- **Responsibility:** Fetching data from external APIs (OpenAlex, USPTO) and loading it into MongoDB.
- *(Future)*: Will be migrated to a task queue (e.g., Celery or Temporal) for robust scheduling and retry logic.

## Deployment Architecture (Milestone 1)
For local development and the initial milestone, the system is orchestrated using Docker Compose.

```
+-------------------+       +--------------------+
|                   |       |                    |
|   React Frontend  |<----->|  FastAPI Backend   |
|   (Port 5173)     | HTTP  |  (Port 8000)       |
|                   |       |                    |
+-------------------+       +--------------------+
                                |            |
                           TCP  |            | TCP
                                v            v
                    +--------------+      +--------------+
                    |              |      |              |
                    |  PostgreSQL  |      |   MongoDB    |
                    |  (Port 5432) |      | (Port 27017) |
                    |              |      |              |
                    +--------------+      +--------------+
```
