# PostgreSQL Database Setup Guide (Docker)

Using Docker is the industry standard for development. It ensures that your local environment matches your future production/cloud deployment.

## Step 1: Install Docker Desktop
1. Go to the official Docker download page: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Download and run the installer for **Windows**.
3. During installation, ensure the **Use WSL 2 instead of Hyper-V (recommended)** option is checked (this makes Docker much faster on Windows).
4. Restart your computer if prompted by the installer.
5. Launch **Docker Desktop** from your Windows Start Menu and accept the service agreement. Once the status bar at the bottom-left turns green, Docker is ready!

---

## Step 2: Spin Up the PostgreSQL Container
1. Open a terminal (PowerShell or Command Prompt) and navigate to the project root directory:
   `c:\Users\Neha\.gemini\antigravity\scratch\Research_Funding_Innovation_Platform`
2. Run the following command to start the database in the background:
   ```powershell
   docker compose up -d
   ```
3. Docker will download the official PostgreSQL image and start the container. You can verify it is running by checking Docker Desktop's UI or running:
   ```powershell
   docker ps
   ```

---

## Step 3: Manage your Database (Optional)
If you want to view tables or run SQL queries visually:
1. You can install **pgAdmin 4** locally, or download a lightweight tool like **DBeaver** (highly recommended for developers: https://dbeaver.io/).
2. To connect your database tool, use the following credentials:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database Name**: `innovation_platform`
   - **Username**: `postgres`
   - **Password**: `postgres`

---

## Step 4: Stop the Database Container
When you are done developing and want to stop the container to save RAM:
```powershell
docker compose down
```
*(Your data will be safely persisted in a Docker volume and will reload automatically the next time you run `docker compose up -d`)*.
