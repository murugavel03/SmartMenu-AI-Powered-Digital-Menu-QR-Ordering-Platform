"use client";
import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/notifications/pusher-client";

export function useConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting">("connecting");

  useEffect(() => {
    const pusher = getPusherClient();
    const conn = pusher.connection;

    const onConnected = () => setStatus("connected");
    const onDisconnected = () => setStatus("disconnected");
    const onConnecting = () => setStatus("connecting");

    conn.bind("connected", onConnected);
    conn.bind("disconnected", onDisconnected);
    conn.bind("connecting", onConnecting);

    // Set initial state
    if (conn.state === "connected") setStatus("connected");

    return () => {
      conn.unbind("connected", onConnected);
      conn.unbind("disconnected", onDisconnected);
      conn.unbind("connecting", onConnecting);
    };
  }, []);

  return status;
}
