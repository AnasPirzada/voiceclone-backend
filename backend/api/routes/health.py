from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    return {"status": "healthy"}


@router.get("/health/ready")
async def readiness_check() -> dict:
    return {"status": "ready"}
