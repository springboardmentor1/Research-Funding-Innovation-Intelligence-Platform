# Demo Execution Guide - Milestone 1

This document provides a step-by-step guide to run the backend, frontend, database systems, and execute user registration, logins, profile setups, and publication/patent sync operations.

---

## 1. Clone Repository
Clone the project repository to your local system:
```bash
git clone https://github.com/springboardmentor1/Research-Funding-Innovation-Intelligence-Platform.git
cd Research-Funding-Innovation-Intelligence-Platform
```

---

## 2. Backend Setup
1. Navigate to the backend directory:
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
3. Install required libraries:
   ```bash
   pip install -r requirements.txt
   ```

---

## 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```

---

## 4. Configure `.env`
1. Navigate to the backend directory:
   ```bash
   cd ../backend
   ```
2. Create a `.env` file copying the keys from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Configure the database credentials:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/research_platform
   SECRET_KEY=generate_a_random_key_string
   ```

---

## 5. Start PostgreSQL
Ensure a local PostgreSQL instance is running, and create the platform database:
```sql
CREATE DATABASE research_platform;
```
*Note: The FastAPI backend automatically builds the database tables on startup.*

---

## 6. Start MongoDB
Launch your local MongoDB server to support document audits:
```bash
mongod --dbpath /data/db
```

---

## 7. Run Backend
Start the backend development server:
```bash
uvicorn app.main:app --reload
```
Open `http://127.0.0.1:8000/docs` in your browser to view the Interactive API documentation (Swagger UI).

---

## 8. Run Frontend
In a new terminal window, navigate to the frontend directory and start the Vite development server:
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` to access the frontend client.

---

## 9. Register User
On the Swagger UI (`http://127.0.0.1:8000/docs`), locate the `/auth/register` endpoint:
1. Click **Try it out**.
2. Pass the user register payload:
   ```json
   {
     "full_name": "Dr. Sarah Connor",
     "email": "sarah.connor@cyberdyne.org",
     "password": "securepassword123",
     "role": "Researcher"
   }
   ```
3. Click **Execute** and confirm a `201 Created` response.

---

## 10. Login
Locate the `/auth/login` endpoint (or click **Authorize** in the top right of the Swagger UI):
1. Input your registered email in `username`: `sarah.connor@cyberdyne.org`.
2. Input your `password`: `securepassword123`.
3. Click **Execute** and retrieve the JWT `access_token`.

---

## 11. Create Research Profile
Locate the `POST /profile` endpoint:
1. Input the Bearer Token in authorization headers.
2. Send the profile payload to establish the search context:
   ```json
   {
     "research_domain": "Robotics & AI",
     "research_subdomain": "Neural Network Control Systems",
     "keywords": "neural networks, robotics, autonomous hardware",
     "organization": "Cyberdyne Research Labs",
     "designation": "Principal Investigator"
   }
   ```
3. Click **Execute** and confirm a `201 Created` response.

---

## 12. Search Publications
Locate the `GET /publications/search` endpoint:
1. Provide the JWT token in authorization headers.
2. Click **Execute**. The backend will connect to OpenAlex API, search works matching the user's research profile domain and keywords, reconstruct the inverted abstracts, and save them.
3. Verify that the synced publications return in the response list.

---

## 13. Search Patents
Locate the `GET /patents/search` endpoint:
1. Provide the JWT token in authorization headers.
2. Click **Execute**. The backend will search and sync patents from The Lens API (or mock generator fallback if the API key is not configured) and save them to the database.
3. Confirm that the synced patents return in the response.
