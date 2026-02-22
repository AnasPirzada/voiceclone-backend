import re
from pathlib import Path
from backend.config.settings import settings


def validate_audio_format(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in settings.ALLOWED_AUDIO_FORMATS


def validate_file_size(size_bytes: int) -> bool:
    return size_bytes <= settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_password_strength(password: str) -> dict:
    checks = {
        "min_length": len(password) >= 8,
        "has_uppercase": bool(re.search(r"[A-Z]", password)),
        "has_lowercase": bool(re.search(r"[a-z]", password)),
        "has_digit": bool(re.search(r"\d", password)),
        "has_special": bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)),
    }
    checks["is_valid"] = all(checks.values())
    return checks
