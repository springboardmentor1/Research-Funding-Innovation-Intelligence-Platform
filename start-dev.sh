#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     AI Research Funding Platform - Development Server      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Check if running on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    IS_WINDOWS=true
else
    IS_WINDOWS=false
fi

# Function to activate venv
activate_venv() {
    if [ "$IS_WINDOWS" = true ]; then
        source backend/venv/Scripts/activate 2>/dev/null || . backend/venv/Scripts/activate
    else
        source backend/venv/bin/activate
    fi
}

# Check Python
echo -e "${YELLOW}Checking Python...${NC}"
if ! command -v python &> /dev/null; then
    echo -e "${RED}✗ Python not found${NC}"
    exit 1
fi
python --version
echo -e "${GREEN}✓ Python found${NC}\n"

# Setup backend
echo -e "${YELLOW}Setting up Backend...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate venv
activate_venv
echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Install requirements
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env created${NC}"
fi

# Install dependencies
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

cd ..

# Setup frontend
echo -e "${YELLOW}Setting up Frontend...${NC}"
cd frontend

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env created${NC}"
fi

# Install node modules if not present
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install -q
fi
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

cd ..

# Start servers
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Starting Development Servers...               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Servers stopped${NC}"
}

# Set up trap to catch Ctrl+C
trap cleanup EXIT

# Start backend
cd backend
activate_venv
echo -e "${GREEN}▶ Starting Backend (Port 8000)...${NC}"
uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
sleep 2
echo -e "${GREEN}✓ Backend running at http://127.0.0.1:8000${NC}"
echo -e "${GREEN}✓ API Docs at http://127.0.0.1:8000/docs${NC}\n"
cd ..

# Start frontend
cd frontend
echo -e "${GREEN}▶ Starting Frontend (Port 5173)...${NC}"
npm run dev &
FRONTEND_PID=$!
sleep 3
echo -e "${GREEN}✓ Frontend running at http://localhost:5173${NC}\n"
cd ..

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Application Ready for Testing                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}Quick Links:${NC}"
echo -e "  Frontend:    ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend:     ${BLUE}http://127.0.0.1:8000${NC}"
echo -e "  API Docs:    ${BLUE}http://127.0.0.1:8000/docs${NC}"
echo -e "  ReDoc:       ${BLUE}http://127.0.0.1:8000/redoc${NC}\n"

echo -e "${YELLOW}Test Credentials:${NC}"
echo -e "  Username: testuser"
echo -e "  Email:    test@example.com"
echo -e "  Password: testpass123\n"

echo -e "${YELLOW}Testing:${NC}"
echo -e "  Backend:  ${BLUE}pytest backend/tests/ -v${NC}"
echo -e "  Frontend: ${BLUE}npm run test (from frontend/)${NC}\n"

echo -e "${YELLOW}Press Ctrl+C to stop servers${NC}\n"

# Wait for background processes
wait
