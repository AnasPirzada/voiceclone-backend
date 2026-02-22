from contextlib import asynccontextmanager
from fastapi import FastAPI
from backend.api.routes import api_router
from backend.api.middleware.cors import setup_cors
from backend.api.middleware.rate_limit import RateLimitMiddleware
from backend.api.middleware.error_handler import setup_error_handlers
from backend.api.middleware.logging import RequestLoggingMiddleware
from backend.database.connection import init_db, close_db
from backend.config.redis_config import close_redis
from backend.config.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
    except Exception as e:
        import logging
        logging.warning(f"Database initialization failed (is PostgreSQL running?): {e}")
    yield
    try:
        await close_db()
    except Exception:
        pass
    try:
        await close_redis()
    except Exception:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

setup_cors(app)
setup_error_handlers(app)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(api_router, prefix="/api/v1")
