from backend.config.settings import settings

CELERY_CONFIG = {
    "broker_url": settings.CELERY_BROKER_URL,
    "result_backend": settings.CELERY_RESULT_BACKEND,
    "task_serializer": "json",
    "result_serializer": "json",
    "accept_content": ["json"],
    "timezone": "UTC",
    "enable_utc": True,
    "task_track_started": True,
    "task_acks_late": True,
    "worker_prefetch_multiplier": 1,
    "task_routes": {
        "workers.tasks.training_task.*": {"queue": "training"},
        "workers.tasks.generation_task.*": {"queue": "generation"},
        "workers.tasks.conversion_task.*": {"queue": "conversion"},
        "workers.tasks.cleanup_task.*": {"queue": "cleanup"},
    },
    "task_default_queue": "default",
    "beat_schedule": {
        "cleanup-temp-files": {
            "task": "workers.tasks.cleanup_task.cleanup_temp_files",
            "schedule": 3600.0,
        },
    },
}
