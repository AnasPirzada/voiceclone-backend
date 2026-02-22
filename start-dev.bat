@echo off
echo ========================================
echo Voice Clone Project - Development Setup
echo ========================================
echo.

echo [1/4] Starting infrastructure services (PostgreSQL, Redis, MinIO)...
docker compose -f docker-compose.dev.yml up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker services
    pause
    exit /b 1
)

echo.
echo [2/4] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [3/4] Starting backend services...
echo   - FastAPI server will start in a new window
echo   - Celery worker will start in a new window

start "FastAPI Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

start "Celery Worker" cmd /k "cd backend && venv\Scripts\activate && celery -A backend.workers.celery_app:celery_app worker --loglevel=info -Q training,generation,conversion,cleanup,default"

echo.
echo [4/4] Starting frontend...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Services:
echo   - Backend API:     http://localhost:8000
echo   - API Docs:        http://localhost:8000/docs
echo   - Frontend:        http://localhost:3000
echo   - MinIO Console:  http://localhost:9001
echo.
echo Press any key to open services in browser...
pause >nul

start http://localhost:8000/docs
start http://localhost:3000
start http://localhost:9001

echo.
echo To stop all services:
echo   1. Close all command windows
echo   2. Run: docker compose -f docker-compose.dev.yml down
echo.
