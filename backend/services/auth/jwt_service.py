from datetime import datetime, timedelta
from jose import jwt, JWTError
from backend.config.settings import settings


class JWTService:
    def create_access_token(self, user_id: str, role: str) -> str:
        expires = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "role": role,
            "exp": expires,
            "type": "access",
        }
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    def create_refresh_token(self, user_id: str) -> str:
        expires = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "sub": user_id,
            "exp": expires,
            "type": "refresh",
        }
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    def decode_token(self, token: str) -> dict | None:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError:
            return None

    def create_token_pair(self, user_id: str, role: str) -> dict:
        return {
            "access_token": self.create_access_token(user_id, role),
            "refresh_token": self.create_refresh_token(user_id),
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }
