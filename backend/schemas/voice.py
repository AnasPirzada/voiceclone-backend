from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class VoiceUploadResponse(BaseModel):
    id: UUID
    voice_profile_id: UUID
    filename: str
    duration_seconds: float
    s3_url: str


class VoiceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    language: str = "en"


class VoiceProfileResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    language: str
    status: str
    sample_count: int
    total_duration_seconds: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VoiceListResponse(BaseModel):
    voices: list[VoiceProfileResponse]
    total: int


class VoiceTrainRequest(BaseModel):
    voice_profile_id: UUID
    epochs: int = Field(default=100, ge=10, le=1000)
    batch_size: int = Field(default=8, ge=1, le=64)
    learning_rate: float = Field(default=0.0001, ge=0.00001, le=0.01)


class VoiceTrainResponse(BaseModel):
    job_id: UUID
    voice_profile_id: UUID
    status: str
