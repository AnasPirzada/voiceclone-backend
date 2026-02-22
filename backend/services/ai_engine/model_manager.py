from pathlib import Path
from backend.config.settings import settings


class ModelManager:
    def __init__(self):
        self._cache_dir = Path(settings.MODEL_CACHE_DIR)
        self._loaded_models: dict[str, object] = {}

    def get_model_path(self, user_id: str, voice_id: str) -> Path:
        return self._cache_dir / user_id / voice_id / "model.pth"

    def is_model_cached(self, user_id: str, voice_id: str) -> bool:
        return self.get_model_path(user_id, voice_id).exists()

    def cache_model(self, user_id: str, voice_id: str, model_data: bytes) -> Path:
        path = self.get_model_path(user_id, voice_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(model_data)
        return path

    def evict_model(self, user_id: str, voice_id: str) -> None:
        path = self.get_model_path(user_id, voice_id)
        if path.exists():
            path.unlink()
        if user_id in self._loaded_models:
            del self._loaded_models[user_id]

    def get_cache_size_bytes(self) -> int:
        return sum(f.stat().st_size for f in self._cache_dir.rglob("*") if f.is_file())
