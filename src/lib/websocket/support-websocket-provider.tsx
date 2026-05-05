"use client";

import { WebSocketProvider } from "@/lib/websocket/websocket-provider";
import { type ReactNode } from "react";

export function SupportWebSocketProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string;
}) {
  if (!userId) return <>{children}</>; // No WS if not logged in

  return (
    <WebSocketProvider userId={userId} sessionId={`support_${userId}`}>
      {children}
    </WebSocketProvider>
  );
}
