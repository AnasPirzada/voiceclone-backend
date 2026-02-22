from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.subscription import Subscription, PlanTier, SubscriptionStatus


PLAN_LIMITS = {
    PlanTier.FREE: {"voices": 3, "generations": 10},
    PlanTier.BASIC: {"voices": 10, "generations": 100},
    PlanTier.PRO: {"voices": 50, "generations": 500},
    PlanTier.ENTERPRISE: {"voices": -1, "generations": -1},
}


class SubscriptionService:
    async def get_or_create(self, db: AsyncSession, user_id: UUID) -> Subscription:
        result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
        sub = result.scalar_one_or_none()
        if sub is None:
            sub = Subscription(user_id=user_id, plan=PlanTier.FREE, status=SubscriptionStatus.ACTIVE)
            db.add(sub)
            await db.flush()
        return sub

    async def update_plan(self, db: AsyncSession, user_id: UUID, plan: PlanTier, stripe_subscription_id: str) -> Subscription:
        sub = await self.get_or_create(db, user_id)
        limits = PLAN_LIMITS[plan]
        sub.plan = plan
        sub.stripe_subscription_id = stripe_subscription_id
        sub.status = SubscriptionStatus.ACTIVE
        sub.monthly_voice_limit = limits["voices"]
        sub.monthly_generation_limit = limits["generations"]
        await db.flush()
        return sub

    async def check_voice_limit(self, db: AsyncSession, user_id: UUID) -> bool:
        sub = await self.get_or_create(db, user_id)
        if sub.monthly_voice_limit == -1:
            return True
        return sub.voices_used < sub.monthly_voice_limit

    async def check_generation_limit(self, db: AsyncSession, user_id: UUID) -> bool:
        sub = await self.get_or_create(db, user_id)
        if sub.monthly_generation_limit == -1:
            return True
        return sub.generations_used < sub.monthly_generation_limit

    async def increment_voice_usage(self, db: AsyncSession, user_id: UUID) -> None:
        sub = await self.get_or_create(db, user_id)
        sub.voices_used += 1
        await db.flush()

    async def increment_generation_usage(self, db: AsyncSession, user_id: UUID) -> None:
        sub = await self.get_or_create(db, user_id)
        sub.generations_used += 1
        await db.flush()
