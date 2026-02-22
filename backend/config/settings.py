from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "VoiceClone AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/voiceclone"

    @model_validator(mode="after")
    def fix_database_url(self):
        """Railway provides postgresql:// but asyncpg needs postgresql+asyncpg://"""
        if self.DATABASE_URL.startswith("postgresql://"):
            self.DATABASE_URL = self.DATABASE_URL.replace(
                "postgresql://", "postgresql+asyncpg://", 1
            )
        return self
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    S3_ENDPOINT_URL: Optional[str] = None
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = "voiceclone-audio"
    S3_REGION: str = "us-east-1"

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_BASIC: str = ""
    STRIPE_PRICE_PRO: str = ""
    STRIPE_PRICE_ENTERPRISE: str = ""

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_AUDIO_FORMATS: list[str] = ["wav", "mp3", "flac", "ogg", "m4a"]
    TEMP_AUDIO_DIR: str = "/tmp/voiceclone"
    MODEL_CACHE_DIR: str = "./data/models"

    WHISPER_MODEL_SIZE: str = "base"
    TTS_MODEL_NAME: str = "tts_models/multilingual/multi-dataset/xtts_v2"

    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
