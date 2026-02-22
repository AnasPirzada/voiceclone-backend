from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class JobStatusResponse(BaseModel):
    id: UUID
    status: str
    progress: int
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class TrainingJobResponse(JobStatusResponse):
    voice_profile_id: UUID
    epochs: int
    current_epoch: int
    loss: float | None


class GenerationJobResponse(JobStatusResponse):
    job_type: str
    voice_profile_id: UUID
    output_audio_url: str | None
    duration_seconds: float | None


class JobListResponse(BaseModel):
    jobs: list[JobStatusResponse]
    total: int
