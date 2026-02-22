import os
import time
from backend.workers.celery_app import celery_app
from backend.config.settings import settings


@celery_app.task(name="workers.tasks.cleanup_task.cleanup_temp_files")
def cleanup_temp_files(max_age_hours: int = 24) -> dict:
    temp_dir = settings.TEMP_AUDIO_DIR
    if not os.path.exists(temp_dir):
        return {"deleted": 0}

    deleted = 0
    cutoff = time.time() - (max_age_hours * 3600)

    for root, dirs, files in os.walk(temp_dir, topdown=False):
        for name in files:
            filepath = os.path.join(root, name)
            if os.path.getmtime(filepath) < cutoff:
                os.remove(filepath)
                deleted += 1
        for name in dirs:
            dirpath = os.path.join(root, name)
            if not os.listdir(dirpath):
                os.rmdir(dirpath)

    return {"deleted": deleted}
