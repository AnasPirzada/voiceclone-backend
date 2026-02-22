from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.models.usage import UsageRecord, UsageType


class UsageTracker:
    async def record(
        self,
        db: AsyncSession,
        user_id: UUID,
        usage_type: UsageType,
        credits: float = 1.0,
        description: str | None = None,
        metadata: dict | None = None,
    ) -> UsageRecord:
        record = UsageRecord(
            user_id=user_id,
            usage_type=usage_type,
            credits_consumed=credits,
            description=description,
            metadata_json=metadata,
        )
        db.add(record)
        await db.flush()
        return record

    async def get_usage_stats(self, db: AsyncSession, user_id: UUID) -> dict:
        total = await db.execute(
            select(func.count(UsageRecord.id)).where(UsageRecord.user_id == user_id)
        )
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly = await db.execute(
            select(func.count(UsageRecord.id)).where(
                UsageRecord.user_id == user_id,
                UsageRecord.created_at >= month_start,
            )
        )
        return {
            "total_usage": total.scalar() or 0,
            "monthly_usage": monthly.scalar() or 0,
        }

    async def get_timeseries(
        self,
        db: AsyncSession,
        user_id: UUID,
        days: int = 30,
    ) -> list[dict]:
        since = datetime.utcnow() - timedelta(days=days)
        result = await db.execute(
            select(
                func.date(UsageRecord.created_at).label("date"),
                UsageRecord.usage_type,
                func.count(UsageRecord.id).label("count"),
            )
            .where(UsageRecord.user_id == user_id, UsageRecord.created_at >= since)
            .group_by(func.date(UsageRecord.created_at), UsageRecord.usage_type)
            .order_by(func.date(UsageRecord.created_at))
        )
        return [{"date": row.date, "type": row.usage_type, "count": row.count} for row in result]
