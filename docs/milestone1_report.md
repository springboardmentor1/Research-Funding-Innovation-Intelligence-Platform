# Project Name: AI Research Funding & Innovation Intelligence Platform

## Milestone 1

### System Architecture

The project is designed using a modular, decoupled full-stack architecture, where distinct backend services and API routers are separated from the frontend interface. The backend is built on **FastAPI** to handle high-performance asynchronous execution and structured RESTful endpoints. The SQLite database is integrated using the **SQLAlchemy ORM** to manage relational tables for users, research profiles, academic publications, grants, and patent assets. Pydantic schemas enforce type safety and parse inbound request bodies and outbound responses at runtime. Data ingestion is managed through dedicated API client scripts that retrieve real-world data from OpenAlex and the USPTO, normalizes the attributes, and populate the database caches. The frontend uses a Vite-based **React** single-page application (SPA) styled with custom dark glassmorphism styling, promoting interactive, component-driven development and clean state-managed user interfaces.

---

### User Interaction and Input Handling

The platform provides user interactions through a responsive dark-themed React web interface. Upon startup, users are presented with options to Register or Sign In with validated credentials. Front-end input components capture data such as emails, passwords, names, and bio profiles, passing them to the FastAPI endpoints. Data schemas are validated on both the client (via local form fields check) and the backend (via Pydantic request models). Pydantic automatically handles incorrect inputs, validation limits, and incorrect types, returning structured JSON errors to ensure smooth execution and prevent runtime server failures due to invalid user inputs. Users can perform query operations across academic publications, grants, and patents with active search inputs, triggering backend filters that return real-time matching tables.

---

### 1. User Registration and Token Authentication

The process of managing user authentication, role assignments, and secure session management is handled by the registration and verification systems. New user registration automatically provisions a database entry alongside an empty profile, and issues a JSON Web Token (JWT) signature for stateless API authorization.

#### **Backend Security & Authentication Components**
* **[auth_service.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/services/auth_service.py) – User Credentials & Profile Provisioner**
* **[auth.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/auth/auth.py) – Token Factory & Auth Gatekeeper**
* **[auth_routes.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/routes/auth_routes.py) – Auth Route Controllers**

---

#### `register_user(db, req)`

##### Detailed Behavior:
* **Duplicate Detection:** Scans the `users` table for existing emails matching the user-provided `req.email`. Raises an HTTP 400 Bad Request error if a duplicate is found.
* **Credential Hashing:** Encrypts user passwords using PBKDF2-HMAC-SHA256 password hashing with a secure salt.
* **Database Commit:** Creates a new `User` record containing the email, name, hashed password, and role (e.g., *Researcher*, *Startup Founder*, *Innovation Manager*, *Administrator*).
* **Profile Provisioning:** Automatically initializes a blank `ResearchProfile` record linked to the user's account via a 1-to-1 relationship.
* **Token Creation:** Generates a stateless JWT access token containing the `user_id` as the subject (`sub`).

##### Key Security Concepts:
* **One-Way Password Salting:** Protects plain credentials from exposure in case of database compromised situations.
* **Cascade Profile Provisioning:** Guarantees database relational integrity by coupling profile records to users during creation.

---

#### `authenticate_user(db, req)`

##### Detailed Behavior:
* **User Search:** Locates the User record matching the input email.
* **Hash Validation:** Verifies the user-entered password against the stored password hash using constant-time evaluation (`hmac.compare_digest`) to mitigate timing attacks.
* **Session Signing:** Generates a signed JWT bearer token with a configured 24-hour expiration duration.

##### Why stateless JWT is good:
* **Resource Efficiency:** Prevents database lookup stress by eliminating server-side session memory persistence.
* **Interoperability:** Standardizes cross-origin frontend requests through HTTP authorization headers.

---

#### `get_current_user(token, db)`

##### Detailed Behavior:
* **Token Decoding:** Decodes the token using the system's `SECRET_KEY` and `HS256` signature algorithm.
* **Signature Guarding:** Raises an HTTP 401 Unauthorized exception if the token signature is invalid or has expired.
* **Relational Validation:** Extracts user ID from the claims, checks the database, and returns the User object only if the account is active.

---

### 2. Research Profile Management

This module manages researcher details, credentials, and institutional properties. The profiles contain metrics like h-index and citations, and support serialized list formats to store domain categories and keywords inside relational columns.

#### **Profile Management Components**
* **[profile_service.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/services/profile_service.py) – Profile CRUD Service**
* **[profile_routes.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/routes/profile_routes.py) – Profile Route Controllers**
* **[profile.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/models/profile.py) – Profile Data Model**

---

#### `get_profile_by_user_id(db, user_id)`

##### Detailed Behavior:
* **Record Retrieval:** Queries `ResearchProfile` table for records matching the authenticated user's ID.
* **Exception Handling:** Returns the profile details, or raises an HTTP 404 Not Found error if the record is missing.

---

#### `update_profile(db, user_id, data)`

##### Detailed Behavior:
* **Target Identification:** Finds the active profile for the authenticated user.
* **Attribute Mapping:** Updates parameters such as bio description, organization, department, citation metrics, and h-index.
* **JSON Serialization:** Serializes list structures (research domains, research keywords) into JSON strings using custom SQLAlchemy properties setters.
* **Database Syncing:** Commits modifications to SQLite and returns the updated profile object.

##### Key Concepts Used:
* **SQLAlchemy Property Getters/Setters:** Intercepts list fields to serialize them automatically to and from JSON strings for database compatibility.
* **SQLite Serialized Column Fields:** Enables the storage of list attributes without requiring complex join queries.

---

### 3. External API Client Integration

This layer contains clients to query academic publications, grants, and patents from external sources. These clients feature a robust fallback cache system to guarantee application stability if the APIs are down or credentials are missing.

#### **External Client Components**
* **[openalex_client.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/ingestion/openalex_client.py) – OpenAlex API Client**
* **[uspto_client.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/ingestion/uspto_client.py) – USPTO ODP Client**
* **[seed_raw_cache.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/ingestion/seed_raw_cache.py) – Raw Cache Seeding Tool**

---

#### `fetch_openalex_publications(query, limit)`

##### Detailed Behavior:
* **Request Assembly:** Generates an HTTP GET request to the OpenAlex works endpoint with the topic string.
* **Credentials Check:** Injects the API key in headers if configured in environment variables.
* **Resilience Fallback:** Catches request exceptions (network timeout, rate limit) and reads raw JSON data from local cache `data/raw/openalex_works.json`.
* **Local Caching:** Writes new successfully fetched JSON responses to the local raw cache directory for offline execution.

##### Why fallback caching is good:
* **Rate-Limit Resilience:** Prevents API blockages during high search volumes.
* **Offline Execution:** Enables offline frontend/backend testing during local development.

---

#### `fetch_openalex_grants(query, limit)`

##### Detailed Behavior:
* **API Inbound Query:** Communicates with the OpenAlex awards endpoint to fetch matching research grants.
* **Resilience Flow:** Implements fallback cache operations using `data/raw/openalex_awards.json` when the API is unreachable.
* **Local Persistence:** Overwrites local cache files upon successful requests.

---

#### `fetch_uspto_patents(query, limit)`

##### Detailed Behavior:
* **Targeted Requesting:** Searches the USPTO Open Data Portal Patent Search endpoint using query structures mapping to `applicationMetaData.inventionTitle`.
* **Auth Verification:** Injects credentials via custom headers `X-API-Key` if configured.
* **Resilience Execution:** Handles failures by loading patent listings from `data/raw/uspto_patents.json`.

---

### 4. Dataset Processing & Database Insertion

This module contains the ETL pipeline that orchestrates external client calls, parses responses, runs data cleanup operations, updates database tables, and exports CSV backups.

#### **ETL Service Components**
* **[load_to_db.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/ingestion/load_to_db.py) – ETL Database Loader**

---

#### `run_ingestion()`

##### Detailed Behavior:
* **Schema Initialization:** Runs SQLAlchemy metadata checks to instantiate all SQL tables if not already initialized.
* **Client Invocation:** Executes API requests to fetch up to 120 publications, 120 grants, and 15 patents.
* **Data Transformation:**
  * Maps and parses nested author arrays into a semicolon-joined string representation.
  * Injects primary domain classifications by ranking level concept scores.
  * Extracts assignee organizations and CPC technology domains from nested structures.
* **Uniqueness Filtering:** Performs query checks on fields like `openalex_id`, `openalex_award_id`, and `patent_number` to skip existing rows and avoid integrity conflicts.
* **CSV Export:** Converts the normalized data structures to Pandas DataFrames and saves them as CSV files to the `data/processed/` directory.

##### Key Concepts:
* **ETL Orchestration:** Handles extraction, transformation, and database loading in a unified workflow.
* **CSV Exports:** Exports clean CSV datasets to support downstream data analysis notebooks.

---

### 5. Search API Routing and Client Data Delivery

This module exposes the API routers that allow users to search and retrieve clean datasets from the database, offering custom case-insensitive query parameters.

#### **API Routing Components**
* **[research_data_routes.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/routes/research_data_routes.py) – Query Service**

---

#### `get_publications(query, db)`

##### Detailed Behavior:
* **Base Querying:** Creates a database query targeting the `Publication` model.
* **Substring Searching:** Filters publication titles, author lists, or primary domains using case-insensitive substring comparisons (`ilike` operators) if a search query is present.
* **Data Delivery:** Validates database outputs against Pydantic responses model formatting and returns the JSON payload.

---

#### `get_grants(query, db)`

##### Detailed Behavior:
* **Relational Querying:** Creates a query targeting the `Grant` model.
* **Search Matching:** Filters grants based on keywords matching the title or funder name.

---

#### `get_patents(query, db)`

##### Detailed Behavior:
* **Database Retrieval:** Creates a query targeting the `Patent` model.
* **Keyword Matching:** Filters patents based on title, assignee name, or CPC technology classifications.

---

#### `refresh_data()`

##### Detailed Behavior:
* **On-Demand Loading:** Initiates the ETL pipeline dynamically via HTTP POST requests, updating database tables and caching data on demand.

---

### Verification and Quality Controls

To ensure system reliability, the codebase includes a dedicated automated script:
* **[verify_milestone1.py](file:///C:/Projects/AI-Research_Funding-And-Innovation%20platform/Backend/verify_milestone1.py) – Milestone 1 Verification Suite**

This script tests all critical operations, checking:
1. **User Registration & Logins** (validates password encryption and JWT authentication outputs).
2. **Profile CRUD Operations** (tests retrieval and serialized updates).
3. **Database Caches** (scans publications, grants, and patents in SQLite).
4. **Live API Integrations** (verifies live connection and response formats for OpenAlex works).

---

**Submitted by**  
*AI Research Funding & Innovation Platform Development Team*
