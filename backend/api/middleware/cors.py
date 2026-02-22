from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings
import os


def setup_cors(app: FastAPI) -> None:
    origins = list(settings.CORS_ORIGINS)

    # In production, also allow the FRONTEND_URL env var if set
    frontend_url = os.environ.get("FRONTEND_URL", "")
    if frontend_url and frontend_url not in origins:
        origins.append(frontend_url)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel preview deployments
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    )
