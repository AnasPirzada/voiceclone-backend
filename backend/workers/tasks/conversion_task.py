from celery import Task
from backend.workers.celery_app import celery_app


class ConversionTask(Task):
    name = "workers.tasks.conversion_task.convert_voice_audio"
    max_retries = 3
    default_retry_delay = 30
    acks_late = True


@celery_app.task(base=ConversionTask, bind=True)
def convert_voice_audio(
    self,
    job_id: str,
    voice_profile_id: str,
    user_id: str,
    input_audio_s3_key: str,
    language: str = "en",
    pitch_shift: float = 0.0,
    emotion: str | None = None,
) -> dict:
    from backend.services.ai_engine.voice_conversion_service import VoiceConversionService
    from backend.services.storage.s3_client import S3Client
    from backend.config.redis_config import RedisKeys
    import redis

    r = redis.from_url("redis://localhost:6379/0")
    r.set(RedisKeys.JOB_STATUS.format(job_id=job_id), "processing")

    try:
        converter = VoiceConversionService()
        s3 = S3Client()

        model_path = s3.download_model(user_id, voice_profile_id)
        input_audio_path = s3.download_file(input_audio_s3_key)

        output_path = converter.convert(
            input_audio_path=input_audio_path,
            model_path=model_path,
            pitch_shift=pitch_shift,
        )

        s3_url = s3.upload_converted_audio(user_id, job_id, output_path)

        r.set(RedisKeys.JOB_STATUS.format(job_id=job_id), "completed")
        return {"status": "completed", "output_url": s3_url}

    except Exception as exc:
        r.set(RedisKeys.JOB_STATUS.format(job_id=job_id), "failed")
        raise self.retry(exc=exc)
