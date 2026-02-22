from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from backend.database.connection import get_db
from backend.api.dependencies import get_admin_user
from backend.models.user import User
from backend.schemas.admin import (
    AdminUserListResponse,
    AdminJobListResponse,
    SystemStatsResponse,
)

router = APIRouter()


@router.get("/users", response_model=AdminUserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> AdminUserListResponse:
    ...


@router.get("/jobs", response_model=AdminJobListResponse)
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    job_type: str | None = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> AdminJobListResponse:
    ...


@router.get("/stats", response_model=SystemStatsResponse)
async def get_system_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> SystemStatsResponse:
    ...


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    ...


@router.post("/jobs/{job_id}/cancel")
async def cancel_job(
    job_id: UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    ...
