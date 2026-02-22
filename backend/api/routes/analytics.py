from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from datetime import datetime, timedelta
import logging

from backend.database.connection import get_db
from backend.api.dependencies import get_current_user
from backend.models.user import User
from backend.models.voice import VoiceProfile
from backend.models.job import TrainingJob, AudioGenerationJob, JobStatus, JobType
from backend.models.audio_file import AudioFile
from backend.models.usage import UsageRecord, UsageType
from backend.schemas.analytics import UsageStatsResponse, UsageTimeSeriesResponse, UsageTimeSeriesPoint

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/usage", response_model=UsageStatsResponse)
async def get_usage_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UsageStatsResponse:
    """Get usage statistics for the current user."""
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Total generations (completed TTS + conversion jobs)
    gen_result = await db.execute(
        select(func.count(AudioGenerationJob.id)).where(
            AudioGenerationJob.user_id == current_user.id,
            AudioGenerationJob.status == JobStatus.COMPLETED,
        )
    )
    total_generations = gen_result.scalar() or 0

    # Total training hours (sum of completed training job durations)
    training_result = await db.execute(
        select(TrainingJob).where(
            TrainingJob.user_id == current_user.id,
            TrainingJob.status == JobStatus.COMPLETED,
        )
    )
    training_jobs = training_result.scalars().all()
    total_training_seconds = 0.0
    for job in training_jobs:
        if job.started_at and job.completed_at:
            delta = (job.completed_at - job.started_at).total_seconds()
            total_training_seconds += delta
    total_training_hours = total_training_seconds / 3600.0

    # Total storage (sum of audio file sizes)
    storage_result = await db.execute(
        select(func.sum(AudioFile.file_size_bytes)).where(
            AudioFile.user_id == current_user.id,
        )
    )
    total_storage_bytes = storage_result.scalar() or 0
    total_storage_mb = total_storage_bytes / (1024 * 1024)

    # Generations this month
    gen_month_result = await db.execute(
        select(func.count(AudioGenerationJob.id)).where(
            AudioGenerationJob.user_id == current_user.id,
            AudioGenerationJob.status == JobStatus.COMPLETED,
            AudioGenerationJob.created_at >= month_start,
        )
    )
    generations_this_month = gen_month_result.scalar() or 0

    # Voices created this month
    voice_month_result = await db.execute(
        select(func.count(VoiceProfile.id)).where(
            VoiceProfile.user_id == current_user.id,
            VoiceProfile.created_at >= month_start,
        )
    )
    voices_this_month = voice_month_result.scalar() or 0

    return UsageStatsResponse(
        total_generations=total_generations,
        total_training_hours=round(total_training_hours, 2),
        total_storage_mb=round(total_storage_mb, 2),
        generations_this_month=generations_this_month,
        voices_this_month=voices_this_month,
    )


@router.get("/usage/timeseries", response_model=UsageTimeSeriesResponse)
async def get_usage_timeseries(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UsageTimeSeriesResponse:
    """Get usage time series data for charts."""
    now = datetime.utcnow()
    period_map = {
        "7d": timedelta(days=7),
        "30d": timedelta(days=30),
        "90d": timedelta(days=90),
        "1y": timedelta(days=365),
    }
    start_date = now - period_map[period]

    data_points = []

    # Get generation counts per day
    gen_result = await db.execute(
        select(AudioGenerationJob).where(
            AudioGenerationJob.user_id == current_user.id,
            AudioGenerationJob.status == JobStatus.COMPLETED,
            AudioGenerationJob.created_at >= start_date,
        ).order_by(AudioGenerationJob.created_at)
    )
    gen_jobs = gen_result.scalars().all()

    # Group by date
    from collections import defaultdict
    daily_counts = defaultdict(lambda: {"generation": 0, "training": 0})

    for job in gen_jobs:
        day = job.created_at.strftime("%Y-%m-%d")
        daily_counts[day]["generation"] += 1

    # Get training counts per day
    train_result = await db.execute(
        select(TrainingJob).where(
            TrainingJob.user_id == current_user.id,
            TrainingJob.created_at >= start_date,
        ).order_by(TrainingJob.created_at)
    )
    train_jobs = train_result.scalars().all()

    for job in train_jobs:
        day = job.created_at.strftime("%Y-%m-%d")
        daily_counts[day]["training"] += 1

    # Build time series points
    for date_str in sorted(daily_counts.keys()):
        counts = daily_counts[date_str]
        if counts["generation"] > 0:
            data_points.append(UsageTimeSeriesPoint(
                date=datetime.strptime(date_str, "%Y-%m-%d"),
                count=counts["generation"],
                type="generation",
            ))
        if counts["training"] > 0:
            data_points.append(UsageTimeSeriesPoint(
                date=datetime.strptime(date_str, "%Y-%m-%d"),
                count=counts["training"],
                type="training",
            ))

    return UsageTimeSeriesResponse(data=data_points, period=period)
