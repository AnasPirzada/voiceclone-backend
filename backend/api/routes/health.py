from fastapi import APIRouter
from sqlalchemy import text
from backend.database.connection import async_session_factory

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    return {"status": "healthy"}


@router.get("/health/ready")
async def readiness_check() -> dict:
    """Check if all services are connected."""
    status = {"status": "ready", "database": "unknown", "redis": "unknown"}

    # Check database
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        status["database"] = "connected"
    except Exception as e:
        status["database"] = f"error: {str(e)[:100]}"
        status["status"] = "degraded"

    # Check Redis
    try:
        from backend.config.redis_config import get_redis
        redis = await get_redis()
        await redis.ping()
        status["redis"] = "connected"
    except Exception as e:
        status["redis"] = f"error: {str(e)[:100]}"
        status["status"] = "degraded"

    return status


@router.get("/health/db-tables")
async def check_db_tables() -> dict:
    """Show all database tables (for debugging)."""
    try:
        async with async_session_factory() as session:
            result = await session.execute(
                text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
            )
            tables = [row[0] for row in result.fetchall()]
        return {"status": "ok", "tables": tables, "count": len(tables)}
    except Exception as e:
        return {"status": "error", "message": str(e)}
