FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

# Upgrade pip and setuptools (needed for openai-whisper)
RUN pip install --upgrade pip setuptools wheel

# Install CPU-only PyTorch first (Railway has no GPUs)
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install openai-whisper separately with --no-build-isolation
# so it can use the globally installed setuptools/pkg_resources
RUN pip install --no-cache-dir --no-build-isolation openai-whisper==20231117

# Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

EXPOSE 8000

ENV PORT=8000
CMD uvicorn backend.api.main:app --host 0.0.0.0 --port $PORT
