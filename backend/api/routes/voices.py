from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
import tempfile
import os
import logging

from backend.database.connection import get_db
from backend.api.dependencies import get_current_user
from backend.models.user import User
from backend.models.voice import VoiceProfile, VoiceStatus
from backend.models.audio_file import AudioFile, AudioFileType
from backend.models.job import TrainingJob, JobStatus
from backend.schemas.voice import (
    VoiceCreateRequest,
    VoiceProfileResponse,
    VoiceListResponse,
    VoiceUploadResponse,
    VoiceTrainRequest,
    VoiceTrainResponse,
)
from backend.schemas.job import TrainingJobResponse
from backend.services.storage.s3_client import S3Client
from backend.workers.tasks.training_task import train_voice_model

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/create", response_model=VoiceProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_voice_profile(
    payload: VoiceCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceProfileResponse:
    """Create a new voice profile for the current user."""
    voice = VoiceProfile(
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        language=payload.language,
        status=VoiceStatus.PENDING,
        sample_count=0,
        total_duration_seconds=0.0,
    )
    db.add(voice)
    await db.flush()
    await db.refresh(voice)
    logger.info(f"Created voice profile {voice.id} for user {current_user.id}")
    return VoiceProfileResponse.model_validate(voice)


@router.post("/upload", response_model=VoiceUploadResponse)
async def upload_voice_sample(
    voice_profile_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceUploadResponse:
    """Upload a voice sample to an existing voice profile."""
    # Verify the voice profile belongs to the user
    result = await db.execute(
        select(VoiceProfile).where(
            VoiceProfile.id == voice_profile_id,
            VoiceProfile.user_id == current_user.id,
        )
    )
    voice = result.scalar_one_or_none()
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice profile not found",
        )

    # Validate file type
    allowed_types = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/flac", "audio/ogg",
                     "audio/x-wav", "audio/x-flac", "audio/m4a", "audio/mp4"]
    if file.content_type and file.content_type not in allowed_types:
        # Also check by extension
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in [".wav", ".mp3", ".flac", ".ogg", ".m4a"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported audio format: {file.content_type}. Supported: WAV, MP3, FLAC, OGG, M4A",
            )

    # Save file temporarily
    temp_dir = tempfile.mkdtemp(prefix="voiceclone_upload_")
    filename = file.filename or f"sample_{voice.sample_count + 1}.wav"
    temp_path = os.path.join(temp_dir, filename)

    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        # Get audio duration
        duration = 0.0
        sample_rate = 44100
        try:
            import librosa
            y, sr = librosa.load(temp_path, sr=None)
            duration = len(y) / sr
            sample_rate = sr
        except Exception:
            pass

        # Upload to S3
        s3 = S3Client()
        s3_url = s3.upload_voice_sample(
            str(current_user.id),
            str(voice_profile_id),
            temp_path,
        )

        s3_key = f"uploads/voice-samples/{current_user.id}/{voice_profile_id}/{filename}"

        # Create audio file record
        audio_file = AudioFile(
            user_id=current_user.id,
            voice_profile_id=voice_profile_id,
            file_type=AudioFileType.SAMPLE,
            filename=filename,
            s3_key=s3_key,
            s3_url=s3_url,
            mime_type=file.content_type or "audio/wav",
            file_size_bytes=len(content),
            duration_seconds=duration,
            sample_rate=sample_rate,
        )
        db.add(audio_file)

        # Update voice profile stats
        voice.sample_count += 1
        voice.total_duration_seconds += duration
        await db.flush()
        await db.refresh(audio_file)

        logger.info(f"Uploaded sample {filename} ({duration:.1f}s) to voice {voice_profile_id}")

        return VoiceUploadResponse(
            id=audio_file.id,
            voice_profile_id=voice_profile_id,
            filename=filename,
            duration_seconds=duration,
            s3_url=s3_url,
        )

    finally:
        # Cleanup temp file
        try:
            os.unlink(temp_path)
            os.rmdir(temp_dir)
        except Exception:
            pass


@router.post("/train", response_model=VoiceTrainResponse, status_code=status.HTTP_202_ACCEPTED)
async def train_voice(
    payload: VoiceTrainRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceTrainResponse:
    """Start training a voice model from uploaded samples."""
    # Verify voice profile exists and belongs to user
    result = await db.execute(
        select(VoiceProfile).where(
            VoiceProfile.id == payload.voice_profile_id,
            VoiceProfile.user_id == current_user.id,
        )
    )
    voice = result.scalar_one_or_none()
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice profile not found",
        )

    # Check if there are uploaded samples
    if voice.sample_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No voice samples uploaded. Please upload at least one audio sample first.",
        )

    # Check minimum duration
    if voice.total_duration_seconds < 3.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total audio duration is too short. Please upload at least 3 seconds of audio.",
        )

    # Prevent duplicate training if already processing
    if voice.status == VoiceStatus.PROCESSING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Voice is already being trained. Please wait for the current training to finish.",
        )

    # Create training job
    job = TrainingJob(
        user_id=current_user.id,
        voice_profile_id=voice.id,
        status=JobStatus.QUEUED,
        epochs=payload.epochs,
        config={
            "batch_size": payload.batch_size,
            "learning_rate": payload.learning_rate,
        },
    )
    db.add(job)

    # Update voice status
    voice.status = VoiceStatus.PROCESSING
    await db.flush()
    await db.refresh(job)

    # Queue the training task via Celery
    train_voice_model.delay(
        job_id=str(job.id),
        voice_profile_id=str(voice.id),
        user_id=str(current_user.id),
        epochs=payload.epochs,
        batch_size=payload.batch_size,
        learning_rate=payload.learning_rate,
    )

    logger.info(f"Queued training job {job.id} for voice {voice.id}")

    return VoiceTrainResponse(
        job_id=job.id,
        voice_profile_id=voice.id,
        status="queued",
    )


@router.get("/status/{job_id}", response_model=TrainingJobResponse)
async def get_training_status(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TrainingJobResponse:
    """Get the status of a training job."""
    result = await db.execute(
        select(TrainingJob).where(
            TrainingJob.id == job_id,
            TrainingJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training job not found",
        )

    return TrainingJobResponse.model_validate(job)


@router.get("/list", response_model=VoiceListResponse)
async def list_voices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceListResponse:
    """List all voice profiles for the current user."""
    result = await db.execute(
        select(VoiceProfile)
        .where(VoiceProfile.user_id == current_user.id)
        .order_by(VoiceProfile.created_at.desc())
    )
    voices = result.scalars().all()

    return VoiceListResponse(
        voices=[VoiceProfileResponse.model_validate(v) for v in voices],
        total=len(voices),
    )


@router.get("/{voice_id}", response_model=VoiceProfileResponse)
async def get_voice(
    voice_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceProfileResponse:
    """Get a specific voice profile."""
    result = await db.execute(
        select(VoiceProfile).where(
            VoiceProfile.id == voice_id,
            VoiceProfile.user_id == current_user.id,
        )
    )
    voice = result.scalar_one_or_none()
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice profile not found",
        )

    return VoiceProfileResponse.model_validate(voice)


@router.delete("/{voice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voice(
    voice_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a voice profile and all associated data."""
    result = await db.execute(
        select(VoiceProfile).where(
            VoiceProfile.id == voice_id,
            VoiceProfile.user_id == current_user.id,
        )
    )
    voice = result.scalar_one_or_none()
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice profile not found",
        )

    # Don't allow deletion while training
    if voice.status == VoiceStatus.PROCESSING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete voice while training is in progress",
        )

    await db.delete(voice)
    logger.info(f"Deleted voice profile {voice_id} for user {current_user.id}")
