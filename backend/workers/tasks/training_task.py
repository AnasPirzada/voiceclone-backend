from celery import Task
from backend.workers.celery_app import celery_app


class TrainingTask(Task):
    name = "workers.tasks.training_task.train_voice_model"
    max_retries = 3
    default_retry_delay = 60
    acks_late = True


@celery_app.task(base=TrainingTask, bind=True)
def train_voice_model(
    self,
    job_id: str,
    voice_profile_id: str,
    user_id: str,
    epochs: int = 100,
    batch_size: int = 8,
    learning_rate: float = 0.0001,
) -> dict:
    from backend.services.ai_engine.voice_clone_service import VoiceTrainingService
    from backend.services.storage.s3_client import S3Client
    from backend.config.redis_config import RedisKeys
    import redis

    r = redis.from_url("redis://localhost:6379/0")
    r.set(RedisKeys.JOB_STATUS.format(job_id=job_id), "processing")
    r.set(RedisKeys.JOB_PROGRESS.format(job_id=job_id), "0")

    try:
        service = VoiceTrainingService()
        s3 = S3Client()

        sample_paths = s3.download_voice_samples(user_id, voice_profile_id)

        def progress_callback(epoch: int, total: int, loss: float):
            progress = int((epoch / total) * 100)
            r.set(RedisKeys.JOB_PROGRESS.format(job_id=job_id), str(progress))

        model_path = service.train(
            sample_paths=sample_paths,
            epochs=epochs,
            batch_size=batch_size,
            learning_rate=learning_rate,
            progress_callback=progress_callback,
        )

        s3_model_path = s3.upload_model(user_id, voice_profile_id, model_path)

        r.set(RedisKeys.JOB_STATUS.format(job_id=job_id), "completed")
        r.set(RedisKeys.JOB_PROGRESS.format(job_id=job_id), "100")

        return {"status": "completed", "model_path": s3_model_path}

    except Exception as exc:
        r.set(RedisKeys.JOB_STATUS.format(job_id=job_id), "failed")
        raise self.retry(exc=exc)
