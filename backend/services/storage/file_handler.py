import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from backend.config.settings import settings


class FileHandler:
    ALLOWED_EXTENSIONS = set(settings.ALLOWED_AUDIO_FORMATS)
    MAX_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    def validate_upload(self, file: UploadFile) -> None:
        ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else ""
        if ext not in self.ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported format: {ext}")
        if file.size and file.size > self.MAX_SIZE:
            raise ValueError(f"File too large: {file.size} bytes")

    async def save_temp(self, file: UploadFile) -> str:
        ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "wav"
        temp_dir = Path(settings.TEMP_AUDIO_DIR)
        temp_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = temp_dir / filename
        content = await file.read()
        filepath.write_bytes(content)
        return str(filepath)

    def cleanup_temp(self, filepath: str) -> None:
        if os.path.exists(filepath):
            os.remove(filepath)
