from backend.config.settings import settings

S3_CONFIG = {
    "endpoint_url": settings.S3_ENDPOINT_URL,
    "aws_access_key_id": settings.S3_ACCESS_KEY_ID,
    "aws_secret_access_key": settings.S3_SECRET_ACCESS_KEY,
    "region_name": settings.S3_REGION,
}

BUCKET_NAME = settings.S3_BUCKET_NAME

S3_PATHS = {
    "voice_samples": "uploads/voice-samples/{user_id}/{voice_id}/",
    "trained_models": "models/{user_id}/{voice_id}/",
    "generated_audio": "output/tts/{user_id}/{job_id}/",
    "converted_audio": "output/conversion/{user_id}/{job_id}/",
    "temp": "temp/{job_id}/",
}
