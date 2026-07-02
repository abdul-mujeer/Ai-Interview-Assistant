#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}AI Interview Assistant - Quick Start${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Please create .env.local with your credentials:"
    echo ""
    echo "  OPENAI_API_KEY=sk-proj-your-key"
    echo "  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net"
    echo "  NEXT_PUBLIC_API_URL=http://localhost:8000"
    echo ""
    echo "See .env.example for template"
    exit 1
fi

# Check if running with Docker or local
if [ "$1" == "docker" ]; then
    echo -e "${GREEN}🐳 Starting with Docker${NC}\n"
    
    # Copy env for docker
    cp .env.local .env
    
    echo -e "${BLUE}Starting services...${NC}"
    docker-compose up
else
    echo -e "${GREEN}🚀 Starting local development${NC}\n"
    
    # Setup backend env
    cp .env.local backend/.env
    
    # Check if virtual environment exists
    if [ ! -d "backend/venv" ]; then
        echo -e "${BLUE}Creating Python virtual environment...${NC}"
        cd backend
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
    else
        source backend/venv/bin/activate
    fi
    
    echo -e "${GREEN}✓ Environment ready${NC}\n"
    
    echo -e "${BLUE}Starting services in background...${NC}\n"
    
    # Start backend in background
    echo -e "${BLUE}Starting Backend (FastAPI on port 8000)...${NC}"
    cd backend
    source venv/bin/activate
    python main.py &
    BACKEND_PID=$!
    cd ..
    
    sleep 2
    
    # Start frontend
    echo -e "${BLUE}Starting Frontend (Next.js on port 3000)...${NC}\n"
    pnpm dev
    
    # Kill backend on exit
    trap "kill $BACKEND_PID" EXIT
fi
