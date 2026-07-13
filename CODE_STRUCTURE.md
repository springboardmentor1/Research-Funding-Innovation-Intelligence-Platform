# Research Funding & Innovation Intelligence Platform - Code Structure Walkthrough

## Overview
This platform is a modern web application for research funding and innovation intelligence. It uses a **FastAPI backend** with SQLAlchemy for database management and a **React frontend** with TanStack Router and Query for routing and data fetching.

## Architecture Philosophy
The codebase follows **clean architecture** principles with clear separation of concerns:
- **Separation of Layers**: API, business logic, data access, and models are distinct
- **Modularity**: Features are organized into logical modules
- **Testability**: Dependencies are injected to allow for easy testing
- **Simplicity**: Code is kept simple and focused on single responsibilities

---

## Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── api/                # API endpoints
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── users.py    # User authentication & management endpoints
│   │       └── data.py     # Research data endpoints (publications, patents, grants)
│   ├── collector/          # External API data collectors
│   │   ├── __init__.py
│   │   ├── base.py         # Base collector class with rate limiting & retries
│   │   ├── patentsview.py  # USPTO PatentsView API integration
│   │   └── grants.py       # Grants.gov API integration
│   ├── core/               # Core utilities
│   │   ├── __init__.py
│   │   ├── config.py       # Settings management using Pydantic
│   │   └── security.py     # Password hashing & JWT token creation
│   ├── crud/               # Data access layer
│   │   ├── __init__.py
│   │   ├── user.py         # User CRUD operations
│   │   └── data.py         # Research data CRUD operations
│   ├── db/                 # Database setup
│   │   ├── __init__.py
│   │   └── session.py      # SQLAlchemy engine & session management
│   ├── models/             # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py         # Base model with auto timestamps
│   │   ├── user.py         # User model & role enum
│   │   ├── publication.py  # Publication model
│   │   ├── patent.py       # Patent model
│   │   └── grant.py        # Grant opportunity model
│   ├── schemas/            # Pydantic schemas for request/response validation
│   │   ├── __init__.py
│   │   ├── user.py         # User schemas
│   │   └── data.py         # Research data schemas
│   └── dependencies.py     # FastAPI dependencies (auth, role checks)
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
└── seed.py                 # Database initialization script
```

### Backend Key Modules Explained

#### 1. `main.py`
- **Purpose**: Entry point of the FastAPI application
- **Key Features**:
  - Initializes FastAPI app with title and version
  - Configures CORS middleware to allow cross-origin requests
  - Includes API routers
  - Manages startup/shutdown events for MongoDB connection
- **Why This Structure**: Keeps the entry point clean and focused on app initialization

#### 2. `app/core/config.py`
- **Purpose**: Centralized configuration management
- **Key Features**:
  - Uses Pydantic Settings for type-safe configuration
  - Loads settings from environment variables or `.env` file
  - Includes database URLs, secret keys, and collector settings
- **Why This Structure**: Separates configuration from code, making it easy to change settings for different environments

#### 3. `app/core/security.py`
- **Purpose**: Authentication and security utilities
- **Key Features**:
  - Password hashing using bcrypt
  - JWT access token creation and verification
- **Why This Structure**: Centralizes security logic for consistency and easier auditing

#### 4. `app/db/session.py`
- **Purpose**: Database connection and session management
- **Key Features**:
  - Creates SQLAlchemy engine with SQLite/PostgreSQL support
  - Session factory for creating database sessions
  - `get_db()` dependency for FastAPI to inject database sessions
- **Why This Structure**: Manages database connections efficiently and provides a clean way to inject sessions into endpoints

#### 5. `app/models/base.py`
- **Purpose**: Base model for all SQLAlchemy models
- **Key Features**:
  - Abstract base class
  - Automatic `id` primary key
  - Automatic `created_at` and `updated_at` timestamps
- **Why This Structure**: Reduces code duplication by providing common fields to all models

#### 6. `app/models/user.py`
- **Purpose**: User model and role definition
- **Key Features**:
  - `UserRole` enum with 4 roles: Researcher, Startup Founder, Innovation Manager, Administrator
  - `User` model with fields for name, email, password, role, etc.
- **Why This Structure**: Clearly defines user roles and user data structure

#### 7. `app/crud/`
- **Purpose**: Data access layer (CRUD operations)
- **Key Features**:
  - Separated into `user.py` and `data.py` for logical grouping
  - All database operations go through CRUD functions
- **Why This Structure**: Decouples API endpoints from database logic, making it easier to test and maintain

#### 8. `app/api/v1/`
- **Purpose**: API endpoint definitions
- **Key Features**:
  - `users.py`: Registration, login, profile management, admin user listing
  - `data.py`: Publications, patents, grants, dashboard stats
- **Why This Structure**: Organizes endpoints by feature, making the API easy to navigate

#### 9. `app/dependencies.py`
- **Purpose**: FastAPI dependencies for authentication and authorization
- **Key Features**:
  - `get_current_user`: Retrieves the authenticated user from JWT token
  - `require_roles`: Factory for creating role-checking dependencies
- **Why This Structure**: Reusable dependencies keep endpoint code clean and focused on business logic

#### 10. `app/collector/`
- **Purpose**: External API data collection
- **Key Features**:
  - `BaseCollector`: Base class with rate limiting, retries, and error handling
  - `PatentsViewCollector`: Fetches patent data from USPTO PatentsView
  - `GrantsGovCollector`: Fetches grant opportunities from Grants.gov
- **Why This Structure**: Encapsulates external API interactions, making it easy to add new collectors

---

## Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   │   ├── AppShell.tsx    # Main app shell with sidebar & top nav
│   │   │   ├── Sidebar.tsx     # Desktop sidebar navigation
│   │   │   ├── TopNav.tsx      # Top navigation bar
│   │   │   └── BottomNav.tsx   # Mobile bottom navigation
│   │   └── ui/             # Shadcn UI components
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context & state management
│   ├── hooks/
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   ├── routes/             # TanStack Router routes
│   │   ├── __root.tsx
│   │   ├── login.tsx       # Login page
│   │   ├── register.tsx    # Register page
│   │   └── _app/           # Protected app routes
│   │       ├── index.tsx   # Dashboard
│   │       ├── patents.tsx
│   │       ├── funding.tsx
│   │       └── ...
│   ├── App.jsx
│   ├── main.jsx
│   └── router.tsx          # Router configuration
├── package.json
├── vite.config.js
└── tsconfig.json
```

### Frontend Key Modules Explained

#### 1. `src/context/AuthContext.tsx`
- **Purpose**: Authentication state management
- **Key Features**:
  - Provides `AuthProvider` to wrap the app
  - Manages user state and JWT token
  - Exposes `useAuth` hook for accessing auth state and methods
  - Methods: `login`, `logout`, `register`, `updateProfile`, `fetchAllUsers`
- **Why This Structure**: Centralizes authentication logic, making it accessible throughout the app

#### 2. `src/components/layout/AppShell.tsx`
- **Purpose**: Main application layout wrapper
- **Key Features**:
  - Responsive design (desktop sidebar, mobile bottom nav)
  - Includes sidebar, top navigation, and main content area
- **Why This Structure**: Provides a consistent layout across all pages

#### 3. `src/routes/`
- **Purpose**: Page components using TanStack Router
- **Key Features**:
  - File-based routing
  - Protected routes under `_app/` that require authentication
  - Login and register pages are public
- **Why This Structure**: File-based routing makes it easy to organize and navigate pages

---

## Key Technical Decisions

### Backend
1. **FastAPI**: Modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints
2. **SQLAlchemy**: SQL toolkit and ORM that gives application developers the full power and flexibility of SQL
3. **Pydantic**: Data validation and settings management using Python type annotations
4. **JWT Authentication**: Stateless authentication using JSON Web Tokens
5. **Modular Structure**: Clear separation of API, CRUD, models, and schemas

### Frontend
1. **React 19**: Latest version of React with improved performance and features
2. **TanStack Router**: Modern, type-safe router for React
3. **TanStack Query**: Powerful data synchronization library for fetching, caching, and updating data
4. **Shadcn UI**: Beautiful, accessible components built with Radix UI and Tailwind CSS
5. **Context API**: For global state management (authentication)

---

## Data Flow

### Authentication Flow
1. User registers or logs in via frontend form
2. Frontend sends credentials to backend `/api/v1/users/register` or `/login`
3. Backend validates credentials, creates/retrieves user, and returns JWT token
4. Frontend stores token in localStorage and updates auth state
5. Subsequent API requests include the JWT token in the Authorization header
6. Backend verifies token and retrieves current user

### Data Fetching Flow
1. Frontend component uses React Query to fetch data
2. Request is sent to backend API endpoint (e.g., `/api/v1/data/publications`)
3. Backend endpoint uses CRUD functions to retrieve data from database
4. Data is returned as JSON and validated with Pydantic schemas
5. Frontend receives data and displays it

---

## Why This Structure?

### Benefits
1. **Maintainability**: Clear separation of concerns makes it easy to find and modify code
2. **Testability**: Dependencies are injected, making unit testing straightforward
3. **Scalability**: Modular structure allows adding new features without disrupting existing code
4. **Developer Experience**: Intuitive organization helps developers get up to speed quickly
5. **Consistency**: Following established patterns ensures code consistency across the codebase

### Principles Followed
- **Single Responsibility Principle**: Each module does one thing and does it well
- **Open/Closed Principle**: Open for extension, closed for modification
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Don't Repeat Yourself (DRY)**: Common logic is extracted into shared modules
