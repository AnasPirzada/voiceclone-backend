from fastapi import WebSocket
from collections import defaultdict
import json


class ConnectionManager:
    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, channel: str) -> None:
        await websocket.accept()
        self._connections[channel].append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str) -> None:
        self._connections[channel].remove(websocket)
        if not self._connections[channel]:
            del self._connections[channel]

    async def broadcast(self, channel: str, data: dict) -> None:
        message = json.dumps(data)
        dead = []
        for ws in self._connections.get(channel, []):
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, channel)

    async def send_job_update(self, job_id: str, status: str, progress: int, **kwargs) -> None:
        await self.broadcast(job_id, {
            "type": "job_update",
            "job_id": job_id,
            "status": status,
            "progress": progress,
            **kwargs,
        })
