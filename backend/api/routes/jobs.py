from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from uuid import UUID
import logging

from backend.database.connection import get_db
from backend.api.dependencies import get_current_user
from backend.models.user import User
from backend.models.job import TrainingJob, AudioGenerationJob, JobStatus, JobType
from backend.schemas.job import JobStatusResponse, JobListResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=JobListResponse)
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    job_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> JobListResponse:
    """List all jobs for the current user (training + generation)."""
    all_jobs = []

    # Fetch training jobs
    training_query = select(TrainingJob).where(TrainingJob.user_id == current_user.id)
    if status_filter:
        training_query = training_query.where(TrainingJob.status == status_filter)
    if job_type and job_type != "training":
        pass  # Skip training jobs if filtering for other types
    else:
        training_result = await db.execute(training_query.order_by(TrainingJob.created_at.desc()))
        for job in training_result.scalars().all():
            all_jobs.append(JobStatusResponse(
                id=job.id,
                status=job.status.value,
                progress=job.progress,
                error_message=job.error_message,
                started_at=job.started_at,
                completed_at=job.completed_at,
                created_at=job.created_at,
            ))

    # Fetch generation jobs
    gen_query = select(AudioGenerationJob).where(AudioGenerationJob.user_id == current_user.id)
    if status_filter:
        gen_query = gen_query.where(AudioGenerationJob.status == status_filter)
    if job_type and job_type != "tts" and job_type != "conversion":
        pass  # Skip generation jobs if filtering for training only
    else:
        gen_result = await db.execute(gen_query.order_by(AudioGenerationJob.created_at.desc()))
        for job in gen_result.scalars().all():
            all_jobs.append(JobStatusResponse(
                id=job.id,
                status=job.status.value,
                progress=100 if job.status == JobStatus.COMPLETED else (50 if job.status == JobStatus.PROCESSING else 0),
                error_message=job.error_message,
                started_at=job.started_at,
                completed_at=job.completed_at,
                created_at=job.created_at,
            ))

    # Sort by created_at descending
    all_jobs.sort(key=lambda j: j.created_at, reverse=True)
    total = len(all_jobs)

    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated = all_jobs[start:end]

    return JobListResponse(jobs=paginated, total=total)


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> JobStatusResponse:
    """Get status of a specific job."""
    # Check training jobs
    result = await db.execute(
        select(TrainingJob).where(
            TrainingJob.id == job_id,
            TrainingJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if job:
        return JobStatusResponse(
            id=job.id,
            status=job.status.value,
            progress=job.progress,
            error_message=job.error_message,
            started_at=job.started_at,
            completed_at=job.completed_at,
            created_at=job.created_at,
        )

    # Check generation jobs
    result = await db.execute(
        select(AudioGenerationJob).where(
            AudioGenerationJob.id == job_id,
            or_(
                AudioGenerationJob.user_id == current_user.id,
                AudioGenerationJob.user_id.is_(None),  # Public jobs
            ),
        )
    )
    gen_job = result.scalar_one_or_none()
    if gen_job:
        progress = 0
        if gen_job.status == JobStatus.COMPLETED:
            progress = 100
        elif gen_job.status == JobStatus.PROCESSING:
            progress = 50

        return JobStatusResponse(
            id=gen_job.id,
            status=gen_job.status.value,
            progress=progress,
            error_message=gen_job.error_message,
            started_at=gen_job.started_at,
            completed_at=gen_job.completed_at,
            created_at=gen_job.created_at,
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Job not found",
    )


@router.post("/{job_id}/cancel")
async def cancel_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Cancel a queued or processing job."""
    # Check training jobs
    result = await db.execute(
        select(TrainingJob).where(
            TrainingJob.id == job_id,
            TrainingJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if job:
        if job.status not in [JobStatus.QUEUED, JobStatus.PROCESSING]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel job with status: {job.status.value}",
            )
        job.status = JobStatus.CANCELLED

        # Also cancel the Celery task if possible
        if job.celery_task_id:
            try:
                from backend.workers.celery_app import celery_app
                celery_app.control.revoke(job.celery_task_id, terminate=True)
            except Exception:
                pass

        logger.info(f"Cancelled training job {job_id}")
        return {"detail": "Job cancelled successfully"}

    # Check generation jobs
    result = await db.execute(
        select(AudioGenerationJob).where(
            AudioGenerationJob.id == job_id,
            AudioGenerationJob.user_id == current_user.id,
        )
    )
    gen_job = result.scalar_one_or_none()
    if gen_job:
        if gen_job.status not in [JobStatus.QUEUED, JobStatus.PROCESSING]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel job with status: {gen_job.status.value}",
            )
        gen_job.status = JobStatus.CANCELLED

        if gen_job.celery_task_id:
            try:
                from backend.workers.celery_app import celery_app
                celery_app.control.revoke(gen_job.celery_task_id, terminate=True)
            except Exception:
                pass

        logger.info(f"Cancelled generation job {job_id}")
        return {"detail": "Job cancelled successfully"}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Job not found",
    )
