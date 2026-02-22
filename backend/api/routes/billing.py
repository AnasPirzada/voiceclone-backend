from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database.connection import get_db
from backend.api.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.billing import (
    CreateCheckoutSessionRequest,
    CheckoutSessionResponse,
    SubscriptionResponse,
)

router = APIRouter()


@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    payload: CreateCheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CheckoutSessionResponse:
    ...


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    ...


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SubscriptionResponse:
    ...


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    ...
