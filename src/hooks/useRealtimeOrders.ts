"use client";
import { useEffect, useCallback, useState } from "react";
import { getPusherClient } from "@/lib/notifications/pusher-client";
import { EVENTS } from "@/lib/notifications/channels";

interface RealtimeOrderEvent {
  id: string;
  orderNumber: string;
  tableName?: string;
  itemCount: number;
  totalAmount: number;
  createdAt: string;
}

interface UseRealtimeOrdersOptions {
  restaurantId: string;
  channelType: "kitchen" | "waiter" | "restaurant";
  onNewOrder?: (order: RealtimeOrderEvent) => void;
  onStatusChange?: (data: { orderId: string; status: string; orderNumber: string }) => void;
}

export function useRealtimeOrders({
  restaurantId,
  channelType,
  onNewOrder,
  onStatusChange,
}: UseRealtimeOrdersOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("connecting");

  const handleNewOrder = useCallback(
    (data: RealtimeOrderEvent) => {
      onNewOrder?.(data);
    },
    [onNewOrder]
  );

  const handleStatusChange = useCallback(
    (data: { orderId: string; status: string; orderNumber: string }) => {
      onStatusChange?.(data);
    },
    [onStatusChange]
  );

  useEffect(() => {
    const pusher = getPusherClient();
    const channelName = `private-${channelType}-${restaurantId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind(EVENTS.ORDER_CREATED, handleNewOrder);
    channel.bind(EVENTS.ORDER_STATUS_CHANGED, handleStatusChange);

    pusher.connection.bind("connected", () => {
      setIsConnected(true);
      setConnectionState("connected");
    });
    pusher.connection.bind("disconnected", () => {
      setIsConnected(false);
      setConnectionState("disconnected");
    });
    pusher.connection.bind("connecting", () => {
      setConnectionState("connecting");
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [restaurantId, channelType, handleNewOrder, handleStatusChange]);

  return { isConnected, connectionState };
}
