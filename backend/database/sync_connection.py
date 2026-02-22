from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.config.settings import settings


# Convert asyncpg URL to psycopg2 for sync operations
def get_sync_database_url() -> str:
    """Convert async database URL to sync database URL."""
    url = settings.DATABASE_URL
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
    elif url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://")
    return url


# Create sync engine for Celery tasks
sync_engine = create_engine(
    get_sync_database_url(),
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

SyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine,
)


def get_sync_db() -> Session:
    """Get a synchronous database session for Celery tasks."""
    db = SyncSessionLocal()
    try:
        return db
    finally:
        pass  # Session will be closed by caller
