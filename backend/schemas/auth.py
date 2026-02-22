from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    avatar_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class RefreshTokenRequest(BaseModel):
    refresh_token: str
