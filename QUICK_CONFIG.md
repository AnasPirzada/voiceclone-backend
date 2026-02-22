# ⚙️ Configuration Guide - Step by Step

## 📋 Prerequisites Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed  
- [ ] Docker Desktop installed and running
- [ ] Git installed

---

## 🔧 Step-by-Step Configuration

### Step 1: Configure Environment Variables

1. Open `.env` file in the project root
2. Copy and paste this configuration:

```env
# Application
APP_NAME=VoiceClone AI
DEBUG=true
ENVIRONMENT=development

# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/voiceclone

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# JWT Secret (IMPORTANT: Change this to a random string!)
JWT_SECRET_KEY=change-this-to-a-random-32-character-string-in-production

# S3 Storage (MinIO for local development)
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=voiceclone-audio
S3_REGION=us-east-1

# CORS (allow frontend to connect)
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

3. **IMPORTANT**: Generate a secure JWT secret:
   ```bash
   # On Windows PowerShell:
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   
   # Or use an online generator: https://randomkeygen.com/
   ```

---

### Step 2: Start Infrastructure Services

Open PowerShell/Terminal in the project root and run:

```bash
docker compose -f docker-compose.dev.yml up -d
```

**What this does:**
- Starts PostgreSQL database (port 5432)
- Starts Redis cache (port 6379)
- Starts MinIO (S3-compatible storage) on ports 9000 & 9001

**Verify it's running:**
```bash
docker compose -f docker-compose.dev.yml ps
```

You should see 3 services: `postgres`, `redis`, `minio`

---

### Step 3: Setup MinIO (S3 Storage)

1. Open browser: http://localhost:9001
2. Login:
   - Username: `minioadmin`
   - Password: `minioadmin`
3. Click **"Create Bucket"**
4. Bucket name: `voiceclone-audio`
5. Click **"Create Bucket"**

✅ Bucket created! Your files will be stored here.

---

### Step 4: Setup Database

```bash
# Navigate to backend
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Run database migrations
alembic upgrade head
```

**Expected output:**
```
INFO  [alembic.runtime.migration] Running upgrade  -> xxxxx, Initial migration
```

---

### Step 5: Install Python Dependencies (if not done)

```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

**Note**: This may take 10-15 minutes as it installs PyTorch and AI libraries.

---

### Step 6: Start Backend API Server

Open a **new terminal window**:

```bash
cd backend
venv\Scripts\activate
uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify**: Open http://localhost:8000/docs
- You should see the Swagger API documentation

---

### Step 7: Start Celery Worker

Open **another new terminal window**:

```bash
cd backend
venv\Scripts\activate
celery -A backend.workers.celery_app:celery_app worker --loglevel=info -Q generation,training,conversion,cleanup,default
```

**Verify**: You should see:
```
[tasks]
  . backend.workers.tasks.generation_task.generate_tts_audio
  ...
```

---

### Step 8: Start Frontend

Open **another new terminal window**:

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

**Verify**: Open http://localhost:3000
- You should see the VoiceClone frontend

---

## ✅ Configuration Complete!

You should now have:
- ✅ Backend API: http://localhost:8000
- ✅ API Docs: http://localhost:8000/docs
- ✅ Frontend: http://localhost:3000
- ✅ MinIO Console: http://localhost:9001

---

## 🧪 Test the Setup

### Test 1: Database Connection
```bash
cd backend
python -c "from backend.database.connection import engine; print('✅ Database OK')"
```

### Test 2: Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

### Test 3: API Health Check
Open browser: http://localhost:8000/api/v1/health
Should return: `{"status":"healthy"}`

### Test 4: Create TTS Job
1. Go to http://localhost:8000/docs
2. Find `POST /api/v1/tts/generate`
3. Click "Try it out"
4. Enter test data (you'll need a trained voice first)

---

## 🚨 Troubleshooting

### Problem: "Database connection failed"
**Solution:**
```bash
# Check PostgreSQL is running
docker compose -f docker-compose.dev.yml ps postgres

# Restart if needed
docker compose -f docker-compose.dev.yml restart postgres
```

### Problem: "Redis connection failed"
**Solution:**
```bash
# Check Redis is running
docker compose -f docker-compose.dev.yml ps redis

# Test connection
redis-cli ping
```

### Problem: "S3/MinIO connection failed"
**Solution:**
1. Check MinIO is running: http://localhost:9001
2. Verify bucket `voiceclone-audio` exists
3. Check `.env` has correct MinIO credentials

### Problem: "Celery worker not processing jobs"
**Solution:**
1. Check Redis is running
2. Verify worker is connected: Look for "connected" message in worker logs
3. Check queue names match: `-Q generation,training,conversion`

### Problem: Port already in use
**Solution:**
- **Port 5432 (PostgreSQL)**: Stop other PostgreSQL instances
- **Port 6379 (Redis)**: Stop other Redis instances  
- **Port 8000 (Backend)**: Change port: `--port 8001`
- **Port 3000 (Frontend)**: Next.js will auto-use 3001

---

## 📚 Next Steps

1. **Register User**: Use the API or frontend to create an account
2. **Create Voice Profile**: Upload voice samples
3. **Train Model**: Train the voice model (this takes time)
4. **Generate TTS**: Once trained, generate audio!

---

## 🎯 Quick Commands Reference

```bash
# Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# Stop infrastructure
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Database migrations
cd backend && alembic upgrade head

# Start backend
cd backend && venv\Scripts\activate && uvicorn backend.api.main:app --reload

# Start Celery worker
cd backend && venv\Scripts\activate && celery -A backend.workers.celery_app:celery_app worker --loglevel=info

# Start frontend
cd frontend && npm run dev
```

---

## 📖 More Information

- Detailed guide: [CONFIGURATION.md](CONFIGURATION.md)
- Quick setup: [SETUP.md](SETUP.md)
- API documentation: http://localhost:8000/docs

---

**Need Help?** Check the logs:
- Backend: Terminal running uvicorn
- Celery: Terminal running celery worker
- Docker: `docker compose -f docker-compose.dev.yml logs`
