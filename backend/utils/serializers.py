from uuid import UUID
from datetime import datetime
from typing import Any


def serialize_uuid(obj: UUID) -> str:
    return str(obj)


def serialize_datetime(obj: datetime) -> str:
    return obj.isoformat()


def serialize_model(obj: Any, exclude: set[str] | None = None) -> dict:
    exclude = exclude or set()
    data = {}
    for key, value in obj.__dict__.items():
        if key.startswith("_") or key in exclude:
            continue
        if isinstance(value, UUID):
            data[key] = str(value)
        elif isinstance(value, datetime):
            data[key] = value.isoformat()
        else:
            data[key] = value
    return data
