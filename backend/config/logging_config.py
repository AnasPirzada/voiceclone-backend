import logging
import sys
from backend.config.settings import settings

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "default",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/app.log",
            "maxBytes": 10485760,
            "backupCount": 5,
            "formatter": "json",
        },
    },
    "root": {
        "level": settings.LOG_LEVEL,
        "handlers": ["console", "file"],
    },
}


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
