from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from backend.utils.exceptions import (
    AppException,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ValidationError,
    RateLimitError,
)
from backend.config.logging_config import get_logger

logger = get_logger(__name__)


def setup_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.error(f"AppException: {exc.detail}", extra={"path": request.url.path})
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(f"Unhandled exception: {str(exc)}", extra={"path": request.url.path})
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
