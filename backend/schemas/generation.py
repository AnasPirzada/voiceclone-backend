from pydantic import BaseModel, Field, model_validator
from uuid import UUID


class TTSRequest(BaseModel):
    voice_profile_id: UUID | None = None  # Optional: use if you have a voice profile
    model_path: str | None = None  # Optional: direct path to model file
    text: str = Field(min_length=1, max_length=5000)
    language: str = Field(default="en")
    emotion: str | None = None
    pitch_shift: float = Field(default=0.0, ge=-12.0, le=12.0)
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    
    @model_validator(mode='after')
    def validate_model_or_voice(self):
        """Ensure either voice_profile_id or model_path is provided."""
        if not self.voice_profile_id and not self.model_path:
            raise ValueError("Either voice_profile_id or model_path must be provided")
        return self


class TTSResponse(BaseModel):
    job_id: UUID
    status: str


class VoiceConversionRequest(BaseModel):
    voice_profile_id: UUID
    language: str = "en"
    pitch_shift: float = Field(default=0.0, ge=-12.0, le=12.0)
    emotion: str | None = None


class VoiceConversionResponse(BaseModel):
    job_id: UUID
    status: str


class GenerationStatusResponse(BaseModel):
    job_id: UUID
    status: str
    progress: int
    output_audio_url: str | None
    duration_seconds: float | None
    error_message: str | None
