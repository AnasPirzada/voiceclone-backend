from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from backend.database.connection import get_db
from backend.api.dependencies import get_current_user
from backend.models.user import User

router = APIRouter()


@router.get("/{file_id}/download")
async def download_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    ...


@router.get("/{file_id}/stream")
async def stream_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    ...


@router.delete("/{file_id}")
async def delete_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    ...
