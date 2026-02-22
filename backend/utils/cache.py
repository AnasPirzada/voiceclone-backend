import json
from typing import Any
from backend.config.redis_config import get_redis, RedisKeys


class CacheService:
    DEFAULT_TTL = 300

    async def get(self, key: str) -> Any | None:
        redis = await get_redis()
        data = await redis.get(key)
        if data is None:
            return None
        return json.loads(data)

    async def set(self, key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
        redis = await get_redis()
        await redis.set(key, json.dumps(value, default=str), ex=ttl)

    async def delete(self, key: str) -> None:
        redis = await get_redis()
        await redis.delete(key)

    async def invalidate_pattern(self, pattern: str) -> None:
        redis = await get_redis()
        async for key in redis.scan_iter(match=pattern):
            await redis.delete(key)

    async def get_job_status(self, job_id: str) -> dict | None:
        redis = await get_redis()
        status = await redis.get(RedisKeys.JOB_STATUS.format(job_id=job_id))
        progress = await redis.get(RedisKeys.JOB_PROGRESS.format(job_id=job_id))
        if status is None:
            return None
        return {"status": status, "progress": int(progress or 0)}

    async def set_job_status(self, job_id: str, status: str, progress: int = 0, ttl: int = 86400) -> None:
        redis = await get_redis()
        pipe = redis.pipeline()
        pipe.set(RedisKeys.JOB_STATUS.format(job_id=job_id), status, ex=ttl)
        pipe.set(RedisKeys.JOB_PROGRESS.format(job_id=job_id), str(progress), ex=ttl)
        await pipe.execute()

    async def cache_voice_list(self, user_id: str, voices: list[dict]) -> None:
        key = RedisKeys.CACHE_VOICE_LIST.format(user_id=user_id)
        await self.set(key, voices, ttl=120)

    async def get_cached_voice_list(self, user_id: str) -> list[dict] | None:
        key = RedisKeys.CACHE_VOICE_LIST.format(user_id=user_id)
        return await self.get(key)

    async def invalidate_voice_cache(self, user_id: str) -> None:
        await self.delete(RedisKeys.CACHE_VOICE_LIST.format(user_id=user_id))


class RateLimiter:
    async def check_rate_limit(self, user_id: str, endpoint: str, limit: int, window: int) -> tuple[bool, int]:
        redis = await get_redis()
        key = RedisKeys.RATE_LIMIT.format(user_id=user_id, endpoint=endpoint)
        current = await redis.get(key)
        if current and int(current) >= limit:
            return False, 0
        pipe = redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, window)
        result = await pipe.execute()
        remaining = max(0, limit - result[0])
        return True, remaining

    async def get_remaining(self, user_id: str, endpoint: str, limit: int) -> int:
        redis = await get_redis()
        key = RedisKeys.RATE_LIMIT.format(user_id=user_id, endpoint=endpoint)
        current = await redis.get(key)
        if current is None:
            return limit
        return max(0, limit - int(current))
