from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class CreateCheckoutSessionRequest(BaseModel):
    plan: str
    is_annual: bool = False
    success_url: str
    cancel_url: str


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


class SubscriptionResponse(BaseModel):
    id: UUID
    plan: str
    status: str
    monthly_voice_limit: int
    monthly_generation_limit: int
    voices_used: int
    generations_used: int
    current_period_start: datetime | None
    current_period_end: datetime | None

    class Config:
        from_attributes = True


class WebhookPayload(BaseModel):
    type: str
    data: dict
