import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from backend.config.logging_config import get_logger

logger = get_logger("api.requests")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time

        logger.info(
            "request",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
                "client_ip": request.client.host if request.client else None,
            },
        )
        response.headers["X-Process-Time"] = str(round(duration * 1000, 2))
        return response
