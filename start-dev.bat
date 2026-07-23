 @echo off
REM AI Research Funding Platform - Development Server Startup Script for Windows

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     AI Research Funding Platform - Development Server      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Python
echo [*] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python not found. Please install Python 3.11+
    exit /b 1
)
python --version
echo [OK] Python found
echo.

REM Setup Backend
echo [*] Setting up Backend...
cd backend

REM Create virtual environment
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate venv
call venv\Scripts\activate.bat
echo [OK] Virtual environment activated

REM Create .env if doesn't exist
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo [OK] .env created
)

REM Install dependencies
echo Installing dependencies...
pip install -q -r requirements.txt
echo [OK] Dependencies installed
echo.

cd ..

REM Setup Frontend
echo [*] Setting up Frontend...
cd frontend

REM Create .env if doesn't exist
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo [OK] .env created
)

REM Install node modules
if not exist node_modules (
    echo Installing Node dependencies...
    call npm install -q
)
echo [OK] Dependencies installed
echo.

cd ..

REM Start servers
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              Starting Development Servers...               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Start backend
cd backend
call venv\Scripts\activate.bat
echo [OK] Starting Backend ^(Port 8000^)...
start "Backend Server" cmd /k "uvicorn main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 2 >nul
echo [OK] Backend running at http://127.0.0.1:8000
echo [OK] API Docs at http://127.0.0.1:8000/docs
cd ..

REM Start frontend
cd frontend
echo [OK] Starting Frontend ^(Port 5173^)...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 >nul
echo [OK] Frontend running at http://localhost:5173
cd ..

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              Application Ready for Testing                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Quick Links:
echo   Frontend:    http://localhost:5173
echo   Backend:     http://127.0.0.1:8000
echo   API Docs:    http://127.0.0.1:8000/docs
echo   ReDoc:       http://127.0.0.1:8000/redoc
echo.

echo [INFO] Test Credentials:
echo   Username: testuser
echo   Email:    test@example.com
echo   Password: testpass123
echo.

echo [INFO] Testing:
echo   Backend:  pytest backend/tests/ -v
echo   Frontend: npm run test (from frontend/)
echo.

echo [INFO] Both servers are running in separate windows. Close windows to stop.
pause

endlocal
