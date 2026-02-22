import logging
import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from backend.config.settings import settings

logger = logging.getLogger(__name__)

# Build connection args for SSL (required by Supabase, Railway, etc.)
connect_args = {}
if settings.ENVIRONMENT == "production" or "supabase" in settings.DATABASE_URL:
    # Supabase and most cloud DBs require SSL
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG,
    connect_args=connect_args,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Create all database tables. Logs success/failure clearly."""
    # Import all models so Base.metadata knows about them
    import backend.models  # noqa: F401

    logger.info("Connecting to database and creating tables...")
    logger.info(f"DATABASE_URL: {settings.DATABASE_URL[:30]}...{settings.DATABASE_URL[-20:]}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully!")


async def close_db() -> None:
    await engine.dispose()
