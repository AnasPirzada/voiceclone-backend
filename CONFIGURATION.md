# Configuration Guide

This guide will help you set up all the components needed for the Voice Clone TTS generation pipeline.

## Prerequisites

- Python 3.11+ (recommended, as Python 3.14 may have compatibility issues with some AI packages)
- Node.js 18+
- Docker and Docker Compose (for infrastructure services)
- PostgreSQL 14+ (or use Docker)
- Redis 6+ (or use Docker)

## Step 1: Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` in the project root and configure the following:

### Required Settings

- **DATABASE_URL**: PostgreSQL connection string
- **REDIS_URL**: Redis connection string
- **CELERY_BROKER_URL**: Redis URL for Celery broker
- **CELERY_RESULT_BACKEND**: Redis URL for Celery results
- **JWT_SECRET_KEY**: Secret key for JWT tokens (generate a secure random string)
- **S3_ACCESS_KEY_ID**: S3/MinIO access key
- **S3_SECRET_ACCESS_KEY**: S3/MinIO secret key
- **S3_BUCKET_NAME**: S3 bucket name
- **S3_ENDPOINT_URL**: S3 endpoint (use `http://localhost:9000` for MinIO)

## Step 2: Start Infrastructure Services (Docker)

The easiest way to run PostgreSQL, Redis, and MinIO (S3-compatible storage) is using Docker Compose:

```bash
# Start all infrastructure services
docker compose -f docker-compose.dev.yml up -d

# Check services are running
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

This will start:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **MinIO** (S3-compatible) on ports 9000 (API) and 9001 (Console)

### Access MinIO Console

1. Open http://localhost:9001
2. Login with:
   - Username: `minioadmin`
   - Password: `minioadmin`
3. Create a bucket named `voiceclone-audio` (or match your `S3_BUCKET_NAME`)

## Step 3: Database Setup

### Install Dependencies

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

### Run Database Migrations

```bash
cd backend

# Create initial migration (if needed)
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### Seed Initial Data (Optional)

```bash
python -m backend.scripts.seed_data
```

## Step 4: Configure S3 Storage

### Option A: Using MinIO (Local Development)

1. Start MinIO with Docker (already done in Step 2)
2. Access MinIO Console at http://localhost:9001
3. Create bucket: `voiceclone-audio`
4. Set bucket policy to allow read/write (or use public for dev)

### Option B: Using AWS S3 (Production)

1. Create an S3 bucket in AWS
2. Create IAM user with S3 access
3. Get access key and secret key
4. Update `.env`:
   ```
   S3_ENDPOINT_URL=  # Leave empty for AWS
   S3_ACCESS_KEY_ID=your-aws-key
   S3_SECRET_ACCESS_KEY=your-aws-secret
   S3_BUCKET_NAME=your-bucket-name
   S3_REGION=us-east-1
   ```

## Step 5: Start Backend Services

### Terminal 1: FastAPI Backend

```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000
API Docs: http://localhost:8000/docs

### Terminal 2: Celery Worker

```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

celery -A backend.workers.celery_app:celery_app worker --loglevel=info -Q training,generation,conversion,cleanup,default
```

Or use the Makefile:
```bash
make dev-worker
```

## Step 6: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:3000

## Step 7: Verify Configuration

### Test Database Connection

```bash
cd backend
python -c "from backend.database.connection import engine; print('Database OK')"
```

### Test Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

### Test S3 Connection

```python
# In Python shell
from backend.services.storage.s3_client import S3Client
s3 = S3Client()
print("S3 connection OK")
```

### Test Celery Connection

```bash
cd backend
celery -A backend.workers.celery_app:celery_app inspect ping
```

## Configuration Checklist

- [ ] `.env` file created and configured
- [ ] PostgreSQL running (port 5432)
- [ ] Redis running (port 6379)
- [ ] MinIO/S3 configured and bucket created
- [ ] Database migrations applied
- [ ] Backend server running (port 8000)
- [ ] Celery worker running
- [ ] Frontend running (port 3000)

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose -f docker-compose.dev.yml ps postgres

# Check connection
psql -h localhost -U postgres -d voiceclone
```

### Redis Connection Issues

```bash
# Check Redis is running
docker compose -f docker-compose.dev.yml ps redis

# Test connection
redis-cli ping
```

### S3/MinIO Issues

```bash
# Check MinIO is running
docker compose -f docker-compose.dev.yml ps minio

# Access MinIO console
# http://localhost:9001
```

### Celery Worker Issues

```bash
# Check Celery can connect to Redis
celery -A backend.workers.celery_app:celery_app inspect active

# View worker logs
celery -A backend.workers.celery_app:celery_app worker --loglevel=debug
```

### Port Conflicts

If ports are already in use:

- **PostgreSQL (5432)**: Change in `docker-compose.dev.yml` and `.env`
- **Redis (6379)**: Change in `docker-compose.dev.yml` and `.env`
- **Backend (8000)**: Change in uvicorn command
- **Frontend (3000)**: Change in `package.json` or Next.js config

## Production Configuration

For production, update these settings:

1. **Security**:
   - Set `DEBUG=false`
   - Use strong `JWT_SECRET_KEY`
   - Enable HTTPS
   - Configure proper CORS origins

2. **Database**:
   - Use managed PostgreSQL (AWS RDS, Azure Database, etc.)
   - Enable connection pooling
   - Set up backups

3. **Redis**:
   - Use managed Redis (AWS ElastiCache, Azure Cache, etc.)
   - Enable persistence
   - Configure authentication

4. **S3**:
   - Use AWS S3 or compatible service
   - Configure bucket policies
   - Enable versioning
   - Set up lifecycle policies

5. **Celery**:
   - Run multiple workers
   - Use process/thread pools
   - Monitor with Flower: `celery -A backend.workers.celery_app:celery_app flower`

## Quick Start Script

Create a `start-dev.sh` (Linux/Mac) or `start-dev.bat` (Windows):

**Windows (`start-dev.bat`)**:
```batch
@echo off
echo Starting infrastructure...
docker compose -f docker-compose.dev.yml up -d

echo Waiting for services...
timeout /t 5

echo Starting backend...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Celery worker...
start cmd /k "cd backend && venv\Scripts\activate && celery -A backend.workers.celery_app:celery_app worker --loglevel=info"

echo Starting frontend...
start cmd /k "cd frontend && npm run dev"

echo All services starting...
pause
```

**Linux/Mac (`start-dev.sh`)**:
```bash
#!/bin/bash
echo "Starting infrastructure..."
docker compose -f docker-compose.dev.yml up -d

echo "Waiting for services..."
sleep 5

echo "Starting backend..."
cd backend && source venv/bin/activate && uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000 &

echo "Starting Celery worker..."
cd backend && source venv/bin/activate && celery -A backend.workers.celery_app:celery_app worker --loglevel=info &

echo "Starting frontend..."
cd frontend && npm run dev &

echo "All services started!"
```

## Next Steps

1. Create a user account via the API or frontend
2. Upload voice samples
3. Train a voice model
4. Generate TTS audio!

For API documentation, visit: http://localhost:8000/docs
