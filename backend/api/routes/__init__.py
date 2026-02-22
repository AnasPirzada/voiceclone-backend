from fastapi import APIRouter
from backend.api.routes.auth import router as auth_router
from backend.api.routes.voices import router as voices_router
from backend.api.routes.generation import router as generation_router
from backend.api.routes.jobs import router as jobs_router
from backend.api.routes.billing import router as billing_router
from backend.api.routes.admin import router as admin_router
from backend.api.routes.health import router as health_router
from backend.api.routes.files import router as files_router
from backend.api.routes.websocket import router as websocket_router
from backend.api.routes.analytics import router as analytics_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(voices_router, prefix="/voice", tags=["voice"])
api_router.include_router(generation_router, tags=["generation"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
api_router.include_router(billing_router, prefix="/billing", tags=["billing"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
api_router.include_router(files_router, prefix="/files", tags=["files"])
api_router.include_router(websocket_router, prefix="/ws", tags=["websocket"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
