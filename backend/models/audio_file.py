import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, ForeignKey, Integer, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from backend.database.connection import Base
import enum


class AudioFileType(str, enum.Enum):
    SAMPLE = "sample"
    GENERATED_TTS = "generated_tts"
    GENERATED_CONVERSION = "generated_conversion"


class AudioFile(Base):
    __tablename__ = "audio_files"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    voice_profile_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("voice_profiles.id"), nullable=True, index=True)
    file_type: Mapped[AudioFileType] = mapped_column(SAEnum(AudioFileType), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    s3_key: Mapped[str] = mapped_column(String(512), nullable=False)
    s3_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_seconds: Mapped[float] = mapped_column(Float, nullable=False)
    sample_rate: Mapped[int] = mapped_column(Integer, default=44100, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    voice_profile: Mapped["VoiceProfile"] = relationship(back_populates="audio_files")
