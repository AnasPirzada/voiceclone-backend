from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from backend.config.redis_config import get_redis, RedisKeys
from backend.config.settings import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.method == "OPTIONS":
            return await call_next(request)

        try:
            client_ip = request.client.host if request.client else "unknown"
            user_id = getattr(request.state, "user_id", client_ip)
            endpoint = request.url.path

            redis = await get_redis()
            key = RedisKeys.RATE_LIMIT.format(user_id=user_id, endpoint=endpoint)

            current = await redis.get(key)
            if current and int(current) >= settings.RATE_LIMIT_REQUESTS:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded",
                )

            pipe = redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, settings.RATE_LIMIT_WINDOW_SECONDS)
            await pipe.execute()

            response = await call_next(request)
            remaining = max(0, settings.RATE_LIMIT_REQUESTS - (int(current or 0) + 1))
            response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_REQUESTS)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(settings.RATE_LIMIT_WINDOW_SECONDS)
            return response
        except HTTPException:
            raise
        except Exception:
            return await call_next(request)
