from celery import Celery
from backend.config.celery_config import CELERY_CONFIG

celery_app = Celery("voiceclone")
celery_app.config_from_object(CELERY_CONFIG)
celery_app.autodiscover_tasks([
    "backend.workers.tasks.training_task",
    "backend.workers.tasks.generation_task",
    "backend.workers.tasks.conversion_task",
    "backend.workers.tasks.cleanup_task",
])
