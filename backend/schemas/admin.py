from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class AdminUserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    plan: str | None
    voices_count: int
    generations_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserListResponse(BaseModel):
    users: list[AdminUserResponse]
    total: int
    page: int
    page_size: int


class AdminJobResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_email: str
    job_type: str
    status: str
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None

    class Config:
        from_attributes = True


class AdminJobListResponse(BaseModel):
    jobs: list[AdminJobResponse]
    total: int
    page: int
    page_size: int


class SystemStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_voices: int
    total_jobs: int
    pending_jobs: int
    processing_jobs: int
    storage_used_gb: float
