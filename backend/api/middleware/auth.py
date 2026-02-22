from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from backend.services.auth.jwt_service import JWTService

jwt_service = JWTService()

PUBLIC_PATHS = {
    "/",
    "/api/v1/health",
    "/api/v1/health/ready",
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/auth/refresh",
    "/api/v1/billing/webhook",
    "/api/v1/tts/generate",  # Public TTS generation
    "/api/v1/tts/status",  # Public TTS status
    "/docs",
    "/redoc",
    "/openapi.json",
}


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path in PUBLIC_PATHS or request.method == "OPTIONS":
            return await call_next(request)

        # Allow public access to TTS endpoints
        if request.url.path.startswith("/api/v1/tts/"):
            return await call_next(request)

        if request.url.path.startswith("/api/v1/ws"):
            return await call_next(request)

        authorization = request.headers.get("Authorization")
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header")

        token = authorization.split(" ", 1)[1]
        payload = jwt_service.decode_token(token)
        if payload is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

        request.state.user_id = payload.get("sub")
        request.state.user_role = payload.get("role")

        return await call_next(request)
