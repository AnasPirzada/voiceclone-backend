import asyncio
import logging
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from backend.config.settings import settings

logger = logging.getLogger(__name__)

# Track whether Redis is available to avoid retrying on every request
_redis_available: bool | None = None  # None = not checked yet


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        global _redis_available

        # Skip rate limiting for OPTIONS and health checks
        if request.method == "OPTIONS" or request.url.path in ("/", "/api/v1/health"):
            return await call_next(request)

        # If we already know Redis is down, skip entirely
        if _redis_available is False:
            return await call_next(request)

        try:
            from backend.config.redis_config import get_redis, RedisKeys

            client_ip = request.client.host if request.client else "unknown"
            user_id = getattr(request.state, "user_id", client_ip)
            endpoint = request.url.path

            redis = await get_redis()
            key = RedisKeys.RATE_LIMIT.format(user_id=user_id, endpoint=endpoint)

            # Wrap Redis call in a short timeout to prevent hanging
            current = await asyncio.wait_for(redis.get(key), timeout=2.0)

            if current and int(current) >= settings.RATE_LIMIT_REQUESTS:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded",
                )

            pipe = redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, settings.RATE_LIMIT_WINDOW_SECONDS)
            await asyncio.wait_for(pipe.execute(), timeout=2.0)

            # Redis is working
            _redis_available = True

            response = await call_next(request)
            remaining = max(0, settings.RATE_LIMIT_REQUESTS - (int(current or 0) + 1))
            response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_REQUESTS)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(settings.RATE_LIMIT_WINDOW_SECONDS)
            return response
        except HTTPException:
            raise
        except Exception as e:
            # Redis is not available — mark it and skip rate limiting
            if _redis_available is None:
                _redis_available = False
                logger.warning(f"Redis unavailable for rate limiting, disabling: {e}")
            return await call_next(request)
