"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { cn, timeAgo } from "@/lib/utils";
import { ChefHat, Wifi, WifiOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { SessionProvider } from "next-auth/react";

interface KitchenOrder {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  specialInstructions?: string;
  table?: { name: string };
  items: {
    id: string;
    name: string;
    variantName?: string;
    quantity: number;
    instructions?: string;
    addons: { name: string; price: number }[];
  }[];
}

const COLUMNS = [
  { status: "PENDING", label: "New Orders", color: "#f59e0b", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { status: "CONFIRMED", label: "Confirmed", color: "#3b82f6", bg: "bg-blue-500/10 border-blue-500/20" },
  { status: "PREPARING", label: "Preparing", color: "#f97316", bg: "bg-orange-500/10 border-orange-500/20" },
  { status: "READY", label: "Ready to Serve", color: "#22c55e", bg: "bg-green-500/10 border-green-500/20" },
];

const NEXT_STATUS: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};

const ACTION_LABELS: Record<string, string> = {
  PENDING: "Accept Order",
  CONFIRMED: "Start Preparing",
  PREPARING: "Mark Ready",
  READY: "Mark Served",
};

function KitchenContent() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connected] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/kitchen/orders");
      const data = await res.json();
      const fetched: KitchenOrder[] = data.orders || [];

      // Check for new orders
      const currentIds = new Set(fetched.map(o => o.id));
      const newIds = new Set<string>();
      currentIds.forEach(id => {
        if (!prevOrderIdsRef.current.has(id)) newIds.add(id);
      });

      if (newIds.size > 0 && prevOrderIdsRef.current.size > 0) {
        setNewOrderIds(newIds);
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
        toast.info(`${newIds.size} new order(s) arrived!`, { duration: 5000 });
        setTimeout(() => setNewOrderIds(new Set()), 5000);
      }

      prevOrderIdsRef.current = currentIds;
      setOrders(fetched);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, [soundEnabled]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [loadOrders]);

  async function updateStatus(orderId: string, status: string) {
    try {
      await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch {
      toast.error("Failed to update order status");
    }
  }

  const ordersByStatus = (status: string) => orders.filter(o => o.status === status);

  return (
    <div className="kitchen-theme min-h-screen p-4">
      {/* Audio */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAGhgBVVVVVVVVVVVVVVVVVVVVVqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1d3d3d3d3d3d3d3d3d3d3d3///////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCgAAAAAAAA" type="audio/mp3" />
      </audio>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
            <p className="text-gray-400 text-sm">{orders.length} active orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(v => !v)}
            className={cn("p-2.5 rounded-xl border transition-colors", soundEnabled ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-gray-700 text-gray-500")}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-sm", connected ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10")}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {connected ? "Connected" : "Disconnected"}
          </div>
          <span className="text-gray-500 text-sm">{format(new Date(), "h:mm a")}</span>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-120px)]">
        {COLUMNS.map(col => {
          const colOrders = ordersByStatus(col.status);
          return (
            <div key={col.status} className="flex flex-col">
              <div className={cn("px-4 py-2.5 rounded-xl mb-3 border flex items-center justify-between", col.bg)}>
                <h2 className="font-bold text-sm" style={{ color: col.color }}>{col.label}</h2>
                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: col.color }}>
                  {colOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colOrders.map(order => (
                  <div
                    key={order.id}
                    className={cn(
                      "bg-gray-900 border border-gray-800 rounded-2xl p-4 transition-all",
                      newOrderIds.has(order.id) && "border-yellow-500 animate-new-order shadow-lg shadow-yellow-500/20"
                    )}
                  >
                    {newOrderIds.has(order.id) && (
                      <div className="text-xs font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2 py-1 mb-2 text-center animate-pulse">
                        🔔 NEW ORDER
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-bold text-white text-sm">{order.orderNumber}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {order.table?.name || "No table"} • {timeAgo(order.createdAt)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{format(new Date(order.createdAt), "h:mm a")}</span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-3">
                      {order.items.map(item => (
                        <div key={item.id} className="bg-gray-800 rounded-xl p-2.5">
                          <div className="flex items-baseline gap-2">
                            <span className="text-orange-400 font-bold text-sm">{item.quantity}×</span>
                            <span className="font-semibold text-white text-sm">{item.name}</span>
                            {item.variantName && <span className="text-gray-400 text-xs">({item.variantName})</span>}
                          </div>
                          {item.addons.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.addons.map((a, i) => (
                                <span key={i} className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                                  {a.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.instructions && (
                            <p className="text-xs text-yellow-400 italic mt-1">"{item.instructions}"</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.specialInstructions && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5 mb-3">
                        <p className="text-xs text-blue-400 font-semibold mb-0.5">Special Note:</p>
                        <p className="text-xs text-blue-300">"{order.specialInstructions}"</p>
                      </div>
                    )}

                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                        className="w-full py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-98"
                        style={{ backgroundColor: col.color }}
                      >
                        {ACTION_LABELS[order.status]}
                      </button>
                    )}
                  </div>
                ))}

                {colOrders.length === 0 && !loading && (
                  <div className="flex items-center justify-center h-32 border border-dashed border-gray-800 rounded-2xl">
                    <p className="text-gray-600 text-sm">No orders</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  return (
    <SessionProvider>
      <KitchenContent />
    </SessionProvider>
  );
}
