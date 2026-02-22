import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum as SAEnum, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from backend.database.connection import Base
import enum


class VoiceStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    TRAINED = "trained"
    FAILED = "failed"


class VoiceProfile(Base):
    __tablename__ = "voice_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    status: Mapped[VoiceStatus] = mapped_column(SAEnum(VoiceStatus), default=VoiceStatus.PENDING, nullable=False)
    sample_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_duration_seconds: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    model_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="voices")
    audio_files: Mapped[list["AudioFile"]] = relationship(back_populates="voice_profile", cascade="all, delete-orphan")
    training_jobs: Mapped[list["TrainingJob"]] = relationship(back_populates="voice_profile")
