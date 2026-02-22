from celery import Task
from backend.workers.celery_app import celery_app
from datetime import datetime
from uuid import UUID
import librosa
from pathlib import Path


class GenerationTask(Task):
    name = "workers.tasks.generation_task.generate_tts_audio"
    max_retries = 3
    default_retry_delay = 30
    acks_late = True


@celery_app.task(base=GenerationTask, bind=True)
def generate_tts_audio(
    self,
    job_id: str,
    voice_profile_id: str,
    user_id: str,
    text: str,
    language: str = "en",
    emotion: str | None = None,
    pitch_shift: float = 0.0,
    speed: float = 1.0,
    model_path: str | None = None,  # Direct model path (for public access)
) -> dict:
    """Generate TTS audio using Coqui TTS and store in S3."""
    from backend.services.ai_engine.tts_service import TTSService
    from backend.services.storage.s3_client import S3Client
    from backend.config.redis_config import RedisKeys
    from backend.database.sync_connection import get_sync_db
    from backend.models.job import AudioGenerationJob, JobStatus

    # Get sync database session
    db = get_sync_db()
    
    try:
        # Update job status to processing
        job = db.query(AudioGenerationJob).filter(AudioGenerationJob.id == UUID(job_id)).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        job.status = JobStatus.PROCESSING
        job.started_at = datetime.utcnow()
        db.commit()
        
        # Update Redis status
        try:
            import redis
            r = redis.from_url("redis://localhost:6379/0")
            r.set(RedisKeys.JOB_STATUS.format(job_id=job_id), "processing")
        except Exception:
            pass  # Redis is optional
        
        # Initialize services
        tts = TTSService()
        s3 = S3Client()
        
        # Get model path - use direct path if provided, otherwise download from S3
        if model_path:
            # Use direct model path (for public access or local models)
            final_model_path = model_path
        else:
            # Download voice model from S3 (for user-specific voices)
            final_model_path = s3.download_model(user_id, voice_profile_id)
        
        # Generate audio
        audio_path = tts.generate(
            text=text,
            model_path=final_model_path,
            language=language,
            emotion=emotion,
            pitch_shift=pitch_shift,
            speed=speed,
        )
        
        # Calculate audio duration
        duration_seconds = 0.0
        try:
            y, sr = librosa.load(audio_path, sr=None)
            duration_seconds = len(y) / sr
        except Exception:
            # Fallback: try to get duration from file metadata
            try:
                import soundfile as sf
                info = sf.info(audio_path)
                duration_seconds = info.duration
            except Exception:
                pass
        
        # Upload generated audio to S3
        s3_url = s3.upload_generated_audio(user_id, job_id, audio_path)
        
        # Update job with results
        job.status = JobStatus.COMPLETED
        job.output_audio_url = s3_url
        job.duration_seconds = duration_seconds
        job.completed_at = datetime.utcnow()
        db.commit()
        
        # Update Redis
        try:
            import redis
            r = redis.from_url("redis://localhost:6379/0")
            r.set(RedisKeys.JOB_STATUS.format(job_id=job_id), "completed")
        except Exception:
            pass
        
        # Cleanup local file
        try:
            Path(audio_path).unlink(missing_ok=True)
        except Exception:
            pass
        
        return {"status": "completed", "output_url": s3_url, "duration": duration_seconds}
        
    except Exception as exc:
        # Update job with error
        try:
            job = db.query(AudioGenerationJob).filter(AudioGenerationJob.id == UUID(job_id)).first()
            if job:
                job.status = JobStatus.FAILED
                job.error_message = str(exc)
                job.completed_at = datetime.utcnow()
                db.commit()
        except Exception:
            pass
        
        # Update Redis
        try:
            import redis
            r = redis.from_url("redis://localhost:6379/0")
            r.set(RedisKeys.JOB_STATUS.format(job_id=job_id), "failed")
        except Exception:
            pass
        
        # Retry if we haven't exceeded max retries
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        else:
            raise exc
    finally:
        db.close()
