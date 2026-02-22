import { useEffect, useRef, useCallback, useState } from "react";
import { WS_RECONNECT_DELAY } from "@/lib/utils/constants";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws";

interface JobUpdate {
  type: "job_update";
  job_id: string;
  status: string;
  progress: number;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (data: JobUpdate) => void;
  autoReconnect?: boolean;
}

export function useJobWebSocket(
  jobId: string | null,
  options?: UseWebSocketOptions
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!jobId) return;

    const wsUrl = `${WS_BASE_URL}/jobs/${jobId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as JobUpdate;
        options?.onMessage?.(data);

        // Auto-close on terminal states
        if (data.status === "completed" || data.status === "failed" || data.status === "cancelled") {
          ws.close();
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;

      // Auto-reconnect if enabled and job is still active
      if (options?.autoReconnect !== false && jobId) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, WS_RECONNECT_DELAY);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [jobId, options]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { isConnected, disconnect };
}
