import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum as SAEnum, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from backend.database.connection import Base
import enum


class JobStatus(str, enum.Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobType(str, enum.Enum):
    TRAINING = "training"
    TTS = "tts"
    CONVERSION = "conversion"


class TrainingJob(Base):
    __tablename__ = "training_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    voice_profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("voice_profiles.id"), nullable=False, index=True)
    status: Mapped[JobStatus] = mapped_column(SAEnum(JobStatus), default=JobStatus.QUEUED, nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    epochs: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    current_epoch: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    loss: Mapped[float | None] = mapped_column(Float, nullable=True)
    celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    voice_profile: Mapped["VoiceProfile"] = relationship(back_populates="training_jobs")


class AudioGenerationJob(Base):
    __tablename__ = "audio_generation_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    voice_profile_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("voice_profiles.id"), nullable=True)
    model_path: Mapped[str | None] = mapped_column(String(512), nullable=True)  # Direct model path for public use
    job_type: Mapped[JobType] = mapped_column(SAEnum(JobType), nullable=False)
    status: Mapped[JobStatus] = mapped_column(SAEnum(JobStatus), default=JobStatus.QUEUED, nullable=False)
    input_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_audio_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    output_audio_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    emotion: Mapped[str | None] = mapped_column(String(50), nullable=True)
    pitch_shift: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    speed: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    parameters: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
