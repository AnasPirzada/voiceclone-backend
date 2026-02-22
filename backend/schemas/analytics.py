from pydantic import BaseModel
from datetime import datetime


class UsageStatsResponse(BaseModel):
    total_generations: int
    total_training_hours: float
    total_storage_mb: float
    generations_this_month: int
    voices_this_month: int


class UsageTimeSeriesPoint(BaseModel):
    date: datetime
    count: int
    type: str


class UsageTimeSeriesResponse(BaseModel):
    data: list[UsageTimeSeriesPoint]
    period: str
