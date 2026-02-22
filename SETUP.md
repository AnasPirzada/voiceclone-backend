# Quick Setup Guide

## 🚀 Quick Start (5 Steps)

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
# Copy this content to .env file
APP_NAME=VoiceClone AI
DEBUG=true
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/voiceclone

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# JWT (generate a random string)
JWT_SECRET_KEY=your-secret-key-min-32-characters-long-change-this

# S3/MinIO (for local development)
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=voiceclone-audio
S3_REGION=us-east-1

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

### 2. Start Infrastructure (Docker)

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)  
- ✅ MinIO/S3 (ports 9000, 9001)

### 3. Setup MinIO Bucket

1. Open http://localhost:9001
2. Login: `minioadmin` / `minioadmin`
3. Click "Create Bucket"
4. Name: `voiceclone-audio`
5. Click "Create Bucket"

### 4. Setup Database

```bash
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Run migrations
alembic upgrade head
```

### 5. Start All Services

**Option A: Use the batch script (Windows)**
```bash
start-dev.bat
```

**Option B: Manual start**

Terminal 1 - Backend:
```bash
cd backend
venv\Scripts\activate
uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 - Celery Worker:
```bash
cd backend
venv\Scripts\activate
celery -A backend.workers.celery_app:celery_app worker --loglevel=info -Q generation,training,conversion
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

## ✅ Verify Setup

1. **Backend**: http://localhost:8000/docs
2. **Frontend**: http://localhost:3000
3. **MinIO**: http://localhost:9001

## 🔧 Common Issues

### Port Already in Use

If ports 5432, 6379, 8000, or 3000 are in use:

**PostgreSQL/Redis**: Edit `docker-compose.dev.yml` to change ports
**Backend**: Change port in uvicorn command: `--port 8001`
**Frontend**: Next.js will auto-use 3001 if 3000 is busy

### Database Connection Error

```bash
# Check PostgreSQL is running
docker compose -f docker-compose.dev.yml ps

# Restart if needed
docker compose -f docker-compose.dev.yml restart postgres
```

### Redis Connection Error

```bash
# Test Redis
redis-cli ping
# Should return: PONG

# Or restart
docker compose -f docker-compose.dev.yml restart redis
```

### Celery Worker Not Processing Jobs

1. Check Redis is running
2. Check Celery worker logs for errors
3. Verify queue name matches: `-Q generation,training,conversion`

## 📝 Next Steps

1. Register a user account
2. Create a voice profile
3. Upload voice samples
4. Train the voice model
5. Generate TTS audio!

For detailed configuration, see [CONFIGURATION.md](CONFIGURATION.md)
