# ============================================
# Stage 1: BUILDER — install all dependencies
# ============================================
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /build

RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

# Pin setuptools for openai-whisper compatibility
RUN pip install --upgrade pip && pip install "setuptools==69.5.1" wheel

# CPU-only PyTorch (Railway has no GPUs)
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# openai-whisper needs --no-build-isolation for pkg_resources
RUN pip install --no-cache-dir --no-build-isolation openai-whisper==20231117

# All other dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Clean up unnecessary files to reduce size
RUN find /usr/local/lib/python3.11/site-packages -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null; \
    find /usr/local/lib/python3.11/site-packages -name '*.pyc' -delete 2>/dev/null; \
    find /usr/local/lib/python3.11/site-packages -name 'tests' -type d -exec rm -rf {} + 2>/dev/null; \
    find /usr/local/lib/python3.11/site-packages -name 'test' -type d -exec rm -rf {} + 2>/dev/null; \
    find /usr/local/lib/python3.11/site-packages -name '*.pyx' -delete 2>/dev/null; \
    find /usr/local/lib/python3.11/site-packages -name '*.c' -delete 2>/dev/null; \
    rm -rf /usr/local/lib/python3.11/site-packages/torch/test 2>/dev/null; \
    rm -rf /usr/local/lib/python3.11/site-packages/torch/testing 2>/dev/null; \
    rm -rf /usr/local/lib/python3.11/site-packages/caffe2 2>/dev/null; \
    true

# ============================================
# Stage 2: RUNTIME — slim final image
# ============================================
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Only runtime dependencies (no build-essential = ~300MB saved)
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY backend/ ./backend/

EXPOSE 8000

ENV PORT=8000
CMD uvicorn backend.api.main:app --host 0.0.0.0 --port $PORT
