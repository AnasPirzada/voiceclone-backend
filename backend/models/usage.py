import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from backend.database.connection import Base
import enum


class UsageType(str, enum.Enum):
    TRAINING = "training"
    TTS_GENERATION = "tts_generation"
    VOICE_CONVERSION = "voice_conversion"
    STORAGE = "storage"


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    usage_type: Mapped[UsageType] = mapped_column(SAEnum(UsageType), nullable=False)
    credits_consumed: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    description: Mapped[str | None] = mapped_column(String(512), nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="usage_records")
