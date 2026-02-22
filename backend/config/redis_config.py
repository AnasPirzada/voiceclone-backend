import redis.asyncio as aioredis
from backend.config.settings import settings

redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
            socket_connect_timeout=3,
            socket_timeout=3,
        )
    return redis_client


async def close_redis() -> None:
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None


class RedisKeys:
    JOB_STATUS = "job:status:{job_id}"
    JOB_PROGRESS = "job:progress:{job_id}"
    RATE_LIMIT = "rate_limit:{user_id}:{endpoint}"
    USER_SESSION = "session:{user_id}"
    CACHE_VOICE_LIST = "cache:voices:{user_id}"
    CACHE_JOB_LIST = "cache:jobs:{user_id}"
    QUEUE_TRAINING = "queue:training"
    QUEUE_GENERATION = "queue:generation"
    QUEUE_CONVERSION = "queue:conversion"
