/* eslint-disable react-hooks/immutability */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const WebSocketContext = createContext<WSContextType | null>(null);

export function WebSocketProvider({
  children,
  userId,
  sessionId,
}: {
  children: ReactNode;
  userId?: string;
  sessionId?: string;
}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    const ws = new WebSocket(`ws://${window.location.host}/api/ws`);

    ws.addEventListener("open", () => {
      console.log("WebSocket connected");
      setIsConnected(true);

      if (userId && sessionId) {
        ws.send(
          JSON.stringify({
            type: "auth",
            userId,
            sessionId,
          }),
        );
      }
    });

    ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "auth_success":
            setIsAuthenticated(true);
            // Load history
            if (data.history) {
              setMessages(data.history);
            }
            break;

          case "ai_message":
          case "user_message":
          case "system":
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                type: data.type,
                content: data.content,
                timestamp: data.timestamp,
              },
            ]);
            break;

          case "typing":
            // Show typing indicator (opsional)
            break;

          case "pong":
            // Heartbeat response
            break;
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.addEventListener("close", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
      setIsAuthenticated(false);

      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(connect, 3000);
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    });

    setSocket(ws);
  }, [userId, sessionId]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [socket, isConnected]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || socket.readyState !== WebSocket.OPEN || !isAuthenticated)
        return;

      const messageId = Date.now().toString();

      socket.send(
        JSON.stringify({
          type: "user_message",
          id: messageId,
          content,
        }),
      );

      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          type: "user_message",
          content,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    [socket, isAuthenticated],
  );

  const authenticate = useCallback(
    (uid: string, sid: string) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;

      socket.send(
        JSON.stringify({
          type: "auth",
          userId: uid,
          sessionId: sid,
        }),
      );
    },
    [socket],
  );

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        isAuthenticated,
        messages,
        sendMessage,
        authenticate,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
