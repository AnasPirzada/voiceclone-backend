from backend.config.logging_config import get_logger

logger = get_logger("voiceclone")

api_logger = get_logger("voiceclone.api")
worker_logger = get_logger("voiceclone.worker")
ai_logger = get_logger("voiceclone.ai_engine")
storage_logger = get_logger("voiceclone.storage")
