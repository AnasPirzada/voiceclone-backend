# VoiceClone AI — Platform Setup Guide

> **Everything you need to set up and run the VoiceClone AI platform locally.**
> This guide covers every service, account, and tool required — step by step.

---

## Table of Contents

1. [Overview — What You Need](#1-overview--what-you-need)
2. [Prerequisites — Install These First](#2-prerequisites--install-these-first)
3. [PostgreSQL (Database)](#3-postgresql-database)
4. [Redis (Task Queue & Cache)](#4-redis-task-queue--cache)
5. [MinIO (S3-Compatible Storage)](#5-minio-s3-compatible-storage)
6. [Python Backend Setup](#6-python-backend-setup)
7. [Coqui TTS (AI Voice Engine)](#7-coqui-tts-ai-voice-engine)
8. [Celery Workers (Background Jobs)](#8-celery-workers-background-jobs)
9. [Next.js Frontend Setup](#9-nextjs-frontend-setup)
10. [Environment Variables Reference](#10-environment-variables-reference)
11. [Running with Docker (Easy Mode)](#11-running-with-docker-easy-mode)
12. [Running Without Docker (Manual Mode)](#12-running-without-docker-manual-mode)
13. [First-Time Startup Checklist](#13-first-time-startup-checklist)
14. [Troubleshooting](#14-troubleshooting)
15. [Production Deployment — Railway](#15-production-deployment--railway-recommended)

---

## 1. Overview — What You Need

| Service         | What It Does                        | Account Needed?           | Cost  |
|-----------------|-------------------------------------|---------------------------|-------|
| **PostgreSQL**  | Stores users, voices, jobs          | No (runs locally)         | FREE  |
| **Redis**       | Task queue + caching                | No (runs locally)         | FREE  |
| **MinIO**       | S3-compatible file storage          | No (runs locally)         | FREE  |
| **Coqui TTS**   | AI voice cloning engine (XTTS v2)   | No (open source)          | FREE  |
| **OpenAI Whisper** | Speech-to-text transcription     | No (open source)          | FREE  |
| **Python 3.11+** | Backend runtime                   | No                        | FREE  |
| **Node.js 18+** | Frontend runtime                   | No                        | FREE  |
| **Docker**      | Container orchestration (optional)  | No (Docker Desktop free for personal) | FREE  |
| **NVIDIA GPU**  | For faster AI processing (optional) | No                        | FREE  |

### **No paid accounts are needed.** Everything runs locally on your machine.

---

## 2. Prerequisites — Install These First

### Required Software

| Software       | Version  | Download Link                                      |
|----------------|----------|----------------------------------------------------|
| **Python**     | 3.11+    | https://www.python.org/downloads/                  |
| **Node.js**    | 18+      | https://nodejs.org/                                |
| **Git**        | Latest   | https://git-scm.com/downloads                      |

### Optional (but recommended)

| Software            | Purpose                    | Download Link                              |
|----------------------|----------------------------|--------------------------------------------|
| **Docker Desktop**   | Run everything in containers | https://www.docker.com/products/docker-desktop/ |
| **NVIDIA CUDA**      | GPU acceleration for AI    | https://developer.nvidia.com/cuda-downloads |
| **VS Code / Cursor** | Code editor                | https://cursor.sh/                         |

---

## 3. PostgreSQL (Database)

PostgreSQL stores all your user data, voice profiles, training jobs, and audio file metadata.

### Option A: Via Docker (Recommended)
```bash
# Included in docker-compose.yml — no manual setup needed
docker compose up postgres -d
```

### Option B: Install Locally

1. **Download:** https://www.postgresql.org/download/
2. **Install** and start the service
3. **Create database:**
```bash
psql -U postgres
CREATE DATABASE voiceclone;
\q
```

### Connection Details (defaults)
```
Host:     localhost
Port:     5432
User:     postgres
Password: postgres
Database: voiceclone
```

**No account creation needed** — PostgreSQL runs locally.

---

## 4. Redis (Task Queue & Cache)

Redis handles the Celery task queue (training/generation jobs) and caching.

### Option A: Via Docker (Recommended)
```bash
# Included in docker-compose.yml
docker compose up redis -d
```

### Option B: Install Locally

- **Windows:** Download from https://github.com/microsoftarchive/redis/releases or use WSL
- **Mac:** `brew install redis && brew services start redis`
- **Linux:** `sudo apt install redis-server && sudo systemctl start redis`

### Connection Details (defaults)
```
URL: redis://localhost:6379/0
```

**No account creation needed** — Redis runs locally.

---

## 5. MinIO (S3-Compatible Storage)

MinIO is a self-hosted S3-compatible object storage. It stores your voice samples, trained models, and generated audio files.

### Option A: Via Docker (Recommended)
```bash
# Included in docker-compose.yml
docker compose up minio -d
```

### Option B: Install Manually

1. **Download:** https://min.io/download
2. **Run:**
```bash
minio server ./data --console-address ":9001"
```

### First-Time Setup: Create a Bucket

1. Open MinIO Console: **http://localhost:9001**
2. Login with:
   - Username: `minioadmin`
   - Password: `minioadmin`
3. Click **"Create Bucket"**
4. Name: `voiceclone-audio`
5. Click **Create**

### Connection Details
```
Endpoint:    http://localhost:9000
Console:     http://localhost:9001
Access Key:  minioadmin
Secret Key:  minioadmin
Bucket:      voiceclone-audio
```

**No external account needed** — MinIO is fully self-hosted.

---

## 6. Python Backend Setup

### Install Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install all packages
pip install -r requirements.txt
```

### Key packages installed:
| Package          | Purpose                              |
|------------------|--------------------------------------|
| `fastapi`        | Web API framework                    |
| `TTS==0.22.0`    | Coqui TTS voice cloning engine       |
| `torch`          | Deep learning backend                |
| `openai-whisper` | Speech transcription                 |
| `celery`         | Background task processing           |
| `sqlalchemy`     | Database ORM                         |
| `boto3`          | S3 client for MinIO                  |
| `librosa`        | Audio processing                     |

### Create .env File

Create `backend/.env`:
```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/voiceclone

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# S3 / MinIO
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=voiceclone-audio
S3_REGION=us-east-1

# JWT
JWT_SECRET_KEY=your-super-secret-key-change-in-production

# AI Models
WHISPER_MODEL_SIZE=base
TTS_MODEL_NAME=tts_models/multilingual/multi-dataset/xtts_v2

# App
DEBUG=true
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000"]
LOG_LEVEL=INFO
```

### Run Database Migrations

```bash
# Initialize the database tables
python -c "import asyncio; from backend.database.connection import init_db; asyncio.run(init_db())"
```

### Start the Backend Server

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

API will be at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

## 7. Coqui TTS (AI Voice Engine)

Coqui TTS is the **open-source AI engine** that powers voice cloning. It uses the **XTTS v2** model.

### How It Gets Installed

It's installed automatically via `pip install -r requirements.txt` (the `TTS==0.22.0` package).

### First-Time Model Download

The first time you run voice cloning, the XTTS v2 model (~1.8GB) will be automatically downloaded. This is a **one-time download**.

```bash
# You can pre-download the model:
python -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')"
```

The model will be cached in `~/.local/share/tts/` (Linux/Mac) or `%USERPROFILE%\.local\share\tts\` (Windows).

### GPU vs CPU

| Mode | Speed       | Setup                   |
|------|-------------|-------------------------|
| GPU  | ~10x faster | Install CUDA + PyTorch GPU |
| CPU  | Works fine  | No extra setup           |

#### Install PyTorch with GPU support (optional):
```bash
# NVIDIA GPU with CUDA 12.1:
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**No account or API key needed** — Coqui TTS is fully open source.

---

## 8. Celery Workers (Background Jobs)

Celery handles long-running tasks like voice training and audio generation in the background.

### Start Celery Worker

```bash
cd backend

# Start worker (processes training + generation jobs)
celery -A backend.workers.celery_app worker --loglevel=info --concurrency=2
```

### For Windows:

```bash
# Windows needs eventlet or gevent
pip install eventlet
celery -A backend.workers.celery_app worker --loglevel=info --pool=eventlet
```

**No account needed** — Celery uses Redis as its message broker.

---

## 9. Next.js Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Create .env.local File

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws
```

### Start the Frontend

```bash
npm run dev
```

Frontend will be at: **http://localhost:3000**

**No external accounts needed** for the frontend.

---

## 10. Environment Variables Reference

### Backend (`backend/.env`)

| Variable                     | Default                                 | Description                          |
|------------------------------|------------------------------------------|--------------------------------------|
| `DATABASE_URL`               | `postgresql+asyncpg://...localhost/voiceclone` | PostgreSQL connection string     |
| `REDIS_URL`                  | `redis://localhost:6379/0`               | Redis connection for caching         |
| `CELERY_BROKER_URL`          | `redis://localhost:6379/1`               | Celery task queue broker             |
| `CELERY_RESULT_BACKEND`      | `redis://localhost:6379/2`               | Celery results storage               |
| `S3_ENDPOINT_URL`            | `http://localhost:9000`                  | MinIO endpoint                       |
| `S3_ACCESS_KEY_ID`           | `minioadmin`                             | MinIO access key                     |
| `S3_SECRET_ACCESS_KEY`       | `minioadmin`                             | MinIO secret key                     |
| `S3_BUCKET_NAME`             | `voiceclone-audio`                       | S3 bucket name                       |
| `JWT_SECRET_KEY`             | (change this!)                           | Secret for JWT tokens                |
| `WHISPER_MODEL_SIZE`         | `base`                                   | Whisper model: tiny/base/small/medium |
| `TTS_MODEL_NAME`             | `tts_models/.../xtts_v2`                | Coqui TTS model                      |
| `DEBUG`                      | `false`                                  | Enable debug mode                    |
| `MAX_UPLOAD_SIZE_MB`         | `50`                                     | Max audio upload size                |

### Frontend (`frontend/.env.local`)

| Variable               | Default                         | Description                 |
|------------------------|----------------------------------|-----------------------------|
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8000/api/v1`   | Backend API URL             |
| `NEXT_PUBLIC_WS_URL`   | `ws://localhost:8000/api/v1/ws`  | WebSocket URL               |

---

## 11. Running with Docker (Easy Mode)

**This is the easiest way to run everything.** One command starts all services.

### Step 1: Install Docker Desktop

Download from: https://www.docker.com/products/docker-desktop/

### Step 2: Start All Services

```bash
# From the project root directory:
docker compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **MinIO** on port 9000 (console on 9001)
- **Backend API** on port 8000
- **Celery Worker** (background)
- **Frontend** on port 3000

### Step 3: Create MinIO Bucket

1. Go to http://localhost:9001
2. Login: `minioadmin` / `minioadmin`
3. Create bucket: `voiceclone-audio`

### Step 4: Open the App

Go to **http://localhost:3000** — you're done!

### Useful Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f worker

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Remove all data (fresh start)
docker compose down -v
```

---

## 12. Running Without Docker (Manual Mode)

If you don't want Docker, start each service manually:

### Terminal 1 — PostgreSQL
```bash
# Make sure PostgreSQL is installed and running
# Create database if needed:
psql -U postgres -c "CREATE DATABASE voiceclone;"
```

### Terminal 2 — Redis
```bash
redis-server
```

### Terminal 3 — MinIO
```bash
minio server ./minio-data --console-address ":9001"
# Then create 'voiceclone-audio' bucket via http://localhost:9001
```

### Terminal 4 — Backend API
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 5 — Celery Worker
```bash
cd backend
source venv/bin/activate
celery -A backend.workers.celery_app worker --loglevel=info
```

### Terminal 6 — Frontend
```bash
cd frontend
npm run dev
```

---

## 13. First-Time Startup Checklist

Run through this checklist after setting everything up:

- [ ] **PostgreSQL** running on port 5432
- [ ] **Redis** running on port 6379
- [ ] **MinIO** running on port 9000
- [ ] **MinIO bucket** `voiceclone-audio` created at http://localhost:9001
- [ ] **Backend .env** file created with correct values
- [ ] **Backend** running on port 8000 — test: http://localhost:8000/docs
- [ ] **Celery worker** running — check terminal for "ready" message
- [ ] **Frontend .env.local** file created
- [ ] **Frontend** running on port 3000 — test: http://localhost:3000
- [ ] **Register** a new user account at http://localhost:3000/auth/register
- [ ] **Create** your first voice profile in the Dashboard
- [ ] **Upload** voice samples (5-30 seconds of clear speech)
- [ ] **Train** the voice model
- [ ] **Generate** speech in the Studio!

---

## 14. Troubleshooting

### "TTS model download is slow"
The XTTS v2 model is ~1.8GB. First download takes a few minutes. It's cached after that.

### "CUDA out of memory"
- Reduce batch size in training settings
- Use CPU mode (slower but works on any machine)
- Set `CUDA_VISIBLE_DEVICES=""` to force CPU

### "Redis connection refused"
```bash
# Check if Redis is running:
redis-cli ping
# Should return: PONG
```

### "MinIO bucket not found"
Go to http://localhost:9001 → login → create bucket named `voiceclone-audio`

### "PostgreSQL connection error"
```bash
# Check if PostgreSQL is running:
psql -U postgres -c "SELECT 1;"
# Create database if missing:
psql -U postgres -c "CREATE DATABASE voiceclone;"
```

### "Import errors for TTS"
```bash
pip install TTS==0.22.0
# If torch issues:
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
```

### "Celery worker not processing jobs"
```bash
# Make sure Redis is running first, then:
celery -A backend.workers.celery_app worker --loglevel=debug
```

### Windows-Specific Issues
- Use `venv\Scripts\activate` instead of `source venv/bin/activate`
- Use `eventlet` pool for Celery: `--pool=eventlet`
- MinIO temp dir: Use `%TEMP%\voiceclone` instead of `/tmp/voiceclone`

---

## Summary

**You do NOT need to create accounts on any external platform.**

Everything runs on your local machine:

| Component    | Runs On        | Account Needed? |
|-------------|----------------|-----------------|
| Database    | Your PC        | No              |
| Cache/Queue | Your PC        | No              |
| File Storage| Your PC (MinIO)| No              |
| AI Engine   | Your PC        | No              |
| Frontend    | Your PC        | No              |
| Backend     | Your PC        | No              |

**Total cost: $0.00** — all open-source software.

---

## 15. Production Deployment — Railway (Recommended)

Railway is the easiest way to deploy your full voice cloning platform to the cloud. It gives you **$5/month free credits** on the Hobby plan and supports Docker-based deployments, managed databases, and private networking out of the box.

### What You'll Deploy on Railway

| Service            | Railway Service Type      | Purpose                              |
|--------------------|---------------------------|--------------------------------------|
| **Backend API**    | Docker (from your repo)   | FastAPI server                       |
| **Celery Worker**  | Docker (from your repo)   | Background training/generation jobs  |
| **PostgreSQL**     | Railway managed plugin    | Database                             |
| **Redis**          | Railway managed plugin    | Task queue + caching                 |

> **Note:** File storage (S3) uses **Cloudflare R2** (set up separately — see Cloudflare R2 section above). The frontend deploys on **Vercel** for free (see section 16).

---

### Step 1: Create a Railway Account

1. Go to **https://railway.app**
2. Click **"Login"** (top right)
3. Sign in with **GitHub** (recommended — it links your repos automatically)
4. You'll be on the **Free Trial** — $5 of usage included
5. To keep the service running long-term, add a credit card to upgrade to the **Hobby Plan ($5/month)**

> **Important:** The free trial has a one-time $5 credit that expires. The Hobby plan gives $5/month in recurring credits — enough for this project in most cases.

---

### Step 2: Push Your Code to GitHub

Railway deploys from GitHub. Make sure your project is pushed:

```bash
cd "D:\Personal_Projects\Voice Clone Project"

git init
git add .
git commit -m "Initial commit - VoiceClone AI"

# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/voiceclone-ai.git
git branch -M main
git push -u origin main
```

---

### Step 3: Create a New Railway Project

1. Go to **https://railway.app/dashboard**
2. Click **"+ New Project"**
3. Select **"Empty Project"**
4. Name it: `voiceclone-ai`

You'll see an empty project canvas. This is where you'll add all services.

---

### Step 4: Add PostgreSQL Database

1. On the project canvas, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will create a PostgreSQL instance instantly
3. Click on the PostgreSQL service → **"Variables"** tab
4. Copy the **`DATABASE_URL`** value — you'll need it later
   - It looks like: `postgresql://postgres:xxxx@xxxx.railway.internal:5432/railway`

> **No manual setup needed** — Railway handles the database creation, backups, and management automatically.

---

### Step 5: Add Redis

1. On the project canvas, click **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway will create a Redis instance instantly
3. Click on the Redis service → **"Variables"** tab
4. Copy the **`REDIS_URL`** value — you'll need it later
   - It looks like: `redis://default:xxxx@xxxx.railway.internal:6379`

---

### Step 6: Deploy the Backend API

1. On the project canvas, click **"+ New"** → **"GitHub Repo"**
2. Select your **voiceclone-ai** repository
3. Railway will detect the repo. **Before it builds**, you need to configure it:

#### 6a. Set the Root Directory & Dockerfile

1. Click on the new service → **"Settings"** tab
2. Set **Service Name** to: `backend-api`
3. Under **"Source"**:
   - **Root Directory:** `backend`
   - **Builder:** `Dockerfile`
   - **Dockerfile Path:** `Dockerfile` (relative to root directory, so it uses `backend/Dockerfile`)
4. Under **"Networking"**:
   - Click **"Generate Domain"** — this gives you a public URL like `backend-api-production-xxxx.up.railway.app`
   - Set **Port** to `8000`

#### 6b. Set Environment Variables

Click on the **"Variables"** tab and add these:

```env
# Database — use Railway's variable reference
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis — use Railway's variable reference
REDIS_URL=${{Redis.REDIS_URL}}
CELERY_BROKER_URL=${{Redis.REDIS_URL}}
CELERY_RESULT_BACKEND=${{Redis.REDIS_URL}}

# Cloudflare R2 Storage (from your R2 setup)
S3_ENDPOINT_URL=https://<your-account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=<your-r2-access-key>
S3_SECRET_ACCESS_KEY=<your-r2-secret-key>
S3_BUCKET_NAME=voiceclone-audio
S3_REGION=auto

# Security
JWT_SECRET_KEY=<generate-a-strong-random-string-here>

# AI Models
WHISPER_MODEL_SIZE=base
TTS_MODEL_NAME=tts_models/multilingual/multi-dataset/xtts_v2

# App Config
DEBUG=false
ENVIRONMENT=production
CORS_ORIGINS=["https://your-frontend-domain.vercel.app"]
LOG_LEVEL=INFO
```

> **Tip:** For `JWT_SECRET_KEY`, generate a secure random string:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

> **Tip:** `${{Postgres.DATABASE_URL}}` and `${{Redis.REDIS_URL}}` are Railway's **variable references** — they automatically inject the correct connection strings. Use the exact service names shown in your Railway project canvas (default names are `Postgres` and `Redis`).

#### 6c. Fix the DATABASE_URL Format

Railway's PostgreSQL URL starts with `postgresql://` but your app uses **asyncpg** which needs `postgresql+asyncpg://`. You have two options:

**Option A:** Add a custom variable with the correct prefix:
```env
DATABASE_URL=postgresql+asyncpg://<rest-of-url-from-railway>
```
Copy the URL from Railway's Postgres service and replace `postgresql://` with `postgresql+asyncpg://`.

**Option B (Recommended):** Update your `settings.py` to auto-fix this:
This is handled in the code fix below.

#### 6d. Deploy

Click **"Deploy"** (or it auto-deploys on push). Railway will:
1. Build your Docker image from `backend/Dockerfile`
2. Install all Python dependencies
3. Start the FastAPI server

**Build time:** ~5-10 minutes (first time, due to PyTorch/TTS downloads)

---

### Step 7: Deploy the Celery Worker

1. On the project canvas, click **"+ New"** → **"GitHub Repo"**
2. Select the **same** repository again
3. Click on the service → **"Settings"** tab

#### 7a. Configure the Worker

1. Set **Service Name** to: `celery-worker`
2. Under **"Source"**:
   - **Root Directory:** `backend`
   - **Builder:** `Dockerfile`
   - **Dockerfile Path:** `workers/Dockerfile`
3. Under **"Networking"**:
   - **Do NOT generate a domain** — the worker doesn't need a public URL

#### 7b. Set Environment Variables

Click **"Variables"** tab — add the **exact same variables** as the backend API:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
CELERY_BROKER_URL=${{Redis.REDIS_URL}}
CELERY_RESULT_BACKEND=${{Redis.REDIS_URL}}
S3_ENDPOINT_URL=https://<your-account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=<your-r2-access-key>
S3_SECRET_ACCESS_KEY=<your-r2-secret-key>
S3_BUCKET_NAME=voiceclone-audio
S3_REGION=auto
JWT_SECRET_KEY=<same-key-as-backend>
WHISPER_MODEL_SIZE=base
TTS_MODEL_NAME=tts_models/multilingual/multi-dataset/xtts_v2
ENVIRONMENT=production
```

> **Important:** The `JWT_SECRET_KEY` must be the **same** value as the backend API service.

#### 7c. Deploy

Click **"Deploy"**. The worker will build and start processing background jobs.

---

### Step 8: Verify Everything is Running

#### Check Railway Dashboard

Your Railway project should now show **4 services**:

```
┌─────────────────────────────────────────────┐
│              voiceclone-ai                  │
│                                             │
│  ┌──────────┐  ┌──────────┐                │
│  │ Postgres │  │  Redis   │                │
│  │  (DB)    │  │ (Queue)  │                │
│  └──────────┘  └──────────┘                │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ backend-api  │  │celery-worker │        │
│  │ (FastAPI)    │  │ (Background) │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
└─────────────────────────────────────────────┘
```

#### Test the Backend API

Open your Railway backend URL in a browser:
```
https://backend-api-production-xxxx.up.railway.app/docs
```

If you see the FastAPI Swagger docs, your backend is live!

> **Note:** If `DEBUG=false`, the `/docs` endpoint is disabled. Temporarily set `DEBUG=true` to test, then switch it back.

#### Check Logs

1. Click any service on Railway
2. Go to the **"Deployments"** tab
3. Click the latest deployment → **"View Logs"**
4. Look for:
   - Backend: `Uvicorn running on http://0.0.0.0:8000`
   - Worker: `celery@xxxx ready.`

---

### Step 9: Deploy Frontend on Vercel

The frontend deploys separately on **Vercel** (free forever for personal projects).

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **"Add New…"** → **"Project"**
3. Import your **voiceclone-ai** repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
5. Add **Environment Variables:**

```env
NEXT_PUBLIC_API_URL=https://backend-api-production-xxxx.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=wss://backend-api-production-xxxx.up.railway.app/api/v1/ws
```

6. Click **"Deploy"**

Your frontend will be live at: `https://voiceclone-ai.vercel.app` (or similar)

---

### Step 10: Update CORS Settings

After deploying the frontend, go back to your Railway **backend-api** service and update:

```env
CORS_ORIGINS=["https://voiceclone-ai.vercel.app"]
```

Replace with your actual Vercel domain.

---

### Railway Cost Breakdown

| Service        | Estimated Monthly Usage | Cost (Hobby Plan) |
|----------------|------------------------|--------------------|
| PostgreSQL     | ~100MB storage         | ~$0.50             |
| Redis          | ~50MB memory           | ~$0.30             |
| Backend API    | ~512MB RAM             | ~$2.00             |
| Celery Worker  | ~1GB RAM               | ~$3.00             |
| **Total**      |                        | **~$5.80/month**   |

> The Hobby plan includes **$5/month free credits**, so you'd pay around **~$1/month out of pocket**.

> **Tip:** To save costs, you can stop the Celery worker when not in use and start it only when you need to train/generate audio.

---

### Railway Useful Commands (Railway CLI)

You can also manage Railway from the command line:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
cd "D:\Personal_Projects\Voice Clone Project"
railway link

# View logs
railway logs --service backend-api
railway logs --service celery-worker

# Open Railway dashboard
railway open

# Set a variable
railway variables set JWT_SECRET_KEY=my-secret --service backend-api

# Deploy manually
railway up --service backend-api
```

---

### Railway Troubleshooting

#### "Build failed — out of memory"
The TTS/PyTorch packages are large. If the build runs out of memory:
1. Go to **Settings** → increase the **Build memory** to 8GB
2. Or add a `.dockerignore` in the `backend` folder:
```
venv/
__pycache__/
*.pyc
.git/
data/
*.md
```

#### "Service keeps restarting"
Check the logs for the specific error:
- **Database connection error:** Make sure `DATABASE_URL` uses `postgresql+asyncpg://` prefix
- **Redis connection error:** Make sure `REDIS_URL` and `CELERY_BROKER_URL` are set correctly
- **Module not found:** Check the Dockerfile and root directory settings

#### "Frontend can't connect to backend"
1. Make sure `CORS_ORIGINS` on the backend includes your Vercel domain
2. Make sure `NEXT_PUBLIC_API_URL` on Vercel points to your Railway backend URL
3. Make sure the backend service has a **generated domain** with HTTPS

#### "Worker not picking up jobs"
1. Check that the worker and backend use the **same** `CELERY_BROKER_URL`
2. Check worker logs for connection errors
3. Make sure Redis is healthy on Railway

#### "Model download takes too long / times out"
The XTTS v2 model (~1.8GB) downloads on first use. Railway's default timeout might be too short:
1. In Railway backend **Settings** → set **Healthcheck Timeout** to 600 seconds
2. Or pre-download the model during Docker build by adding to the `Dockerfile`:
```dockerfile
# Add before the CMD line:
RUN python -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')" || true
```
> **Warning:** This makes the Docker image ~3GB+ and the build takes much longer, but the service starts faster.

---

### Quick Reference — All Production URLs

After deployment, your services will be at:

| Service         | URL                                                       |
|-----------------|-----------------------------------------------------------|
| **Frontend**    | `https://voiceclone-ai.vercel.app`                        |
| **Backend API** | `https://backend-api-production-xxxx.up.railway.app`      |
| **API Docs**    | `https://backend-api-production-xxxx.up.railway.app/docs` |
| **Railway DB**  | Managed (internal only)                                   |
| **Railway Redis**| Managed (internal only)                                  |
| **R2 Storage**  | `https://<account-id>.r2.cloudflarestorage.com`           |

**Total cost: ~$1-5/month** (Railway Hobby) + **$0** (Vercel Free) + **$0** (R2 Free Tier, 10GB)
