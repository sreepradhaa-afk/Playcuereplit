import { useEffect, useRef, useState, useCallback } from "react";

interface WSMessage {
  type: string;
  payload: any;
}

export function useWebSocket(roomCode: string | null, userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomCode || !userId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      // Join room
      ws.send(JSON.stringify({
        type: "join-room",
        payload: { roomCode, userId },
      }));
    };

    ws.onmessage = (event) => {
      const message: WSMessage = JSON.parse(event.data);
      setLastMessage(message);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [roomCode, userId]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  return { isConnected, lastMessage, sendMessage };
}
