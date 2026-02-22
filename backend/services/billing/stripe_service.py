import stripe
from backend.config.settings import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

PLAN_PRICE_MAP = {
    "basic": settings.STRIPE_PRICE_BASIC,
    "pro": settings.STRIPE_PRICE_PRO,
    "enterprise": settings.STRIPE_PRICE_ENTERPRISE,
}


class StripeService:
    def create_customer(self, email: str, name: str) -> str:
        customer = stripe.Customer.create(email=email, name=name)
        return customer.id

    def create_checkout_session(
        self,
        customer_id: str,
        plan: str,
        is_annual: bool,
        success_url: str,
        cancel_url: str,
    ) -> dict:
        price_id = PLAN_PRICE_MAP.get(plan)
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return {"session_id": session.id, "url": session.url}

    def cancel_subscription(self, subscription_id: str) -> None:
        stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)

    def construct_webhook_event(self, payload: bytes, sig_header: str) -> stripe.Event:
        return stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
