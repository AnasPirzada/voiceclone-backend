from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from backend.services.websocket.manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/jobs/{job_id}")
async def job_status_ws(
    websocket: WebSocket,
    job_id: str,
) -> None:
    await manager.connect(websocket, job_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, job_id)
