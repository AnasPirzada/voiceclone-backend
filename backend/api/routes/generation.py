from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import datetime
import tempfile
import os
import logging

from backend.database.connection import get_db
from backend.api.dependencies import get_current_user
from backend.models.user import User
from backend.models.job import AudioGenerationJob, JobType, JobStatus
from backend.models.voice import VoiceProfile, VoiceStatus
from backend.schemas.generation import (
    TTSRequest,
    TTSResponse,
    VoiceConversionRequest,
    VoiceConversionResponse,
    GenerationStatusResponse,
)
from backend.workers.tasks.generation_task import generate_tts_audio
from backend.workers.tasks.conversion_task import convert_voice_audio
from backend.services.storage.s3_client import S3Client

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/tts/generate", response_model=TTSResponse, status_code=202)
async def generate_tts(
    payload: TTSRequest,
    db: AsyncSession = Depends(get_db),
) -> TTSResponse:
    """Create a TTS generation job and queue it for processing."""
    model_path = payload.model_path
    voice_profile_id = payload.voice_profile_id

    # If voice_profile_id is provided, verify it exists and is trained
    if voice_profile_id:
        voice_result = await db.execute(
            select(VoiceProfile).where(
                VoiceProfile.id == voice_profile_id,
                VoiceProfile.status == VoiceStatus.TRAINED,
            )
        )
        voice_profile = voice_result.scalar_one_or_none()

        if not voice_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Voice profile not found or not trained",
            )

        model_path = voice_profile.model_path
        if not model_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Voice profile does not have a trained model",
            )
    elif not model_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either voice_profile_id or model_path must be provided",
        )

    # Create job record
    job = AudioGenerationJob(
        user_id=None,
        voice_profile_id=voice_profile_id,
        model_path=model_path,
        job_type=JobType.TTS,
        status=JobStatus.QUEUED,
        input_text=payload.text,
        language=payload.language,
        emotion=payload.emotion,
        pitch_shift=payload.pitch_shift,
        speed=payload.speed,
        parameters={
            "text": payload.text,
            "language": payload.language,
            "emotion": payload.emotion,
            "pitch_shift": payload.pitch_shift,
            "speed": payload.speed,
        },
    )

    db.add(job)
    await db.flush()

    # Queue Celery task
    task = generate_tts_audio.delay(
        job_id=str(job.id),
        voice_profile_id=str(voice_profile_id) if voice_profile_id else "public",
        user_id="public",
        text=payload.text,
        language=payload.language,
        emotion=payload.emotion,
        pitch_shift=payload.pitch_shift,
        speed=payload.speed,
        model_path=model_path,
    )

    job.celery_task_id = task.id
    await db.commit()

    return TTSResponse(
        job_id=job.id,
        status=job.status.value,
    )


@router.get("/tts/status/{job_id}", response_model=GenerationStatusResponse)
async def get_tts_status(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> GenerationStatusResponse:
    """Get the status of a TTS generation job."""
    result = await db.execute(
        select(AudioGenerationJob).where(
            AudioGenerationJob.id == job_id,
            AudioGenerationJob.job_type == JobType.TTS,
        )
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    progress = 0
    if job.status == JobStatus.QUEUED:
        progress = 0
    elif job.status == JobStatus.PROCESSING:
        progress = 50
    elif job.status == JobStatus.COMPLETED:
        progress = 100

    return GenerationStatusResponse(
        job_id=job.id,
        status=job.status.value,
        progress=progress,
        output_audio_url=job.output_audio_url,
        duration_seconds=job.duration_seconds,
        error_message=job.error_message,
    )


@router.post("/convert", response_model=VoiceConversionResponse, status_code=202)
async def convert_voice(
    voice_profile_id: UUID,
    language: str = "en",
    pitch_shift: float = 0.0,
    emotion: str | None = None,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceConversionResponse:
    """Create a voice conversion job from uploaded audio."""
    # Verify the voice profile is trained
    voice_result = await db.execute(
        select(VoiceProfile).where(
            VoiceProfile.id == voice_profile_id,
            VoiceProfile.user_id == current_user.id,
            VoiceProfile.status == VoiceStatus.TRAINED,
        )
    )
    voice = voice_result.scalar_one_or_none()
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice profile not found or not trained",
        )

    if not voice.model_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Voice profile does not have a trained model",
        )

    # Save uploaded file temporarily and upload to S3
    temp_dir = tempfile.mkdtemp(prefix="voiceclone_convert_")
    filename = file.filename or "input_audio.wav"
    temp_path = os.path.join(temp_dir, filename)

    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        s3 = S3Client()
        s3_key = f"temp/conversion/{current_user.id}/{filename}"
        s3.upload_file(temp_path, s3_key)
    finally:
        try:
            os.unlink(temp_path)
            os.rmdir(temp_dir)
        except Exception:
            pass

    # Create job record
    job = AudioGenerationJob(
        user_id=current_user.id,
        voice_profile_id=voice_profile_id,
        model_path=voice.model_path,
        job_type=JobType.CONVERSION,
        status=JobStatus.QUEUED,
        input_audio_url=s3_key,
        language=language,
        emotion=emotion,
        pitch_shift=pitch_shift,
    )
    db.add(job)
    await db.flush()

    # Queue Celery task
    task = convert_voice_audio.delay(
        job_id=str(job.id),
        voice_profile_id=str(voice_profile_id),
        user_id=str(current_user.id),
        input_audio_s3_key=s3_key,
        language=language,
        pitch_shift=pitch_shift,
        emotion=emotion,
    )

    job.celery_task_id = task.id
    await db.commit()

    logger.info(f"Queued voice conversion job {job.id}")

    return VoiceConversionResponse(
        job_id=job.id,
        status=job.status.value,
    )


@router.get("/convert/status/{job_id}", response_model=GenerationStatusResponse)
async def get_conversion_status(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GenerationStatusResponse:
    """Get the status of a voice conversion job."""
    result = await db.execute(
        select(AudioGenerationJob).where(
            AudioGenerationJob.id == job_id,
            AudioGenerationJob.job_type == JobType.CONVERSION,
            AudioGenerationJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversion job not found",
        )

    progress = 0
    if job.status == JobStatus.QUEUED:
        progress = 0
    elif job.status == JobStatus.PROCESSING:
        progress = 50
    elif job.status == JobStatus.COMPLETED:
        progress = 100

    return GenerationStatusResponse(
        job_id=job.id,
        status=job.status.value,
        progress=progress,
        output_audio_url=job.output_audio_url,
        duration_seconds=job.duration_seconds,
        error_message=job.error_message,
    )
