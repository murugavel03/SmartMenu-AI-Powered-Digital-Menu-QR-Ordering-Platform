"use client";
import { useEffect, useState, useCallback } from "react";
import { cn, getTableStatusColor, getOrderStatusColor, formatCurrency, timeAgo } from "@/lib/utils";
import { User, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { SessionProvider } from "next-auth/react";
import type { OrderStatus } from "@/types";

interface WaiterTable {
  id: string;
  name: string;
  capacity: number;
  status: string;
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: { name: string; quantity: number; addons: { name: string }[] }[];
  }[];
}

function WaiterContent() {
  const [tables, setTables] = useState<WaiterTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<WaiterTable | null>(null);

  const loadTables = useCallback(async () => {
    try {
      const res = await fetch("/api/waiter/tables");
      const data = await res.json();
      setTables(data.tables || []);
      // Update selected table
      if (selectedTable) {
        const updated = data.tables?.find((t: WaiterTable) => t.id === selectedTable.id);
        if (updated) setSelectedTable(updated);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 8000);
    return () => clearInterval(interval);
  }, [loadTables]);

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("Order updated");
    loadTables();
  }

  const activeOrders = tables.flatMap(t => t.orders).filter(o =>
    !["COMPLETED", "CANCELLED", "SERVED"].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Waiter Dashboard</h1>
            <p className="text-sm text-gray-500">{activeOrders.length} active orders across {tables.length} tables</p>
          </div>
        </div>
        <a href="/admin" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          Admin →
        </a>
      </div>

      <div className="flex h-[calc(100vh-72px)]">
        {/* Table Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="font-semibold text-gray-700 mb-4">Table Overview</h2>
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {tables.map(table => {
                const activeOrder = table.orders[0];
                const isSelected = selectedTable?.id === table.id;
                const statusColor = getTableStatusColor(table.status);

                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(isSelected ? null : table)}
                    className={cn(
                      "bg-white border-2 rounded-2xl p-4 text-left transition-all hover:shadow-md",
                      isSelected ? "shadow-lg scale-105" : "border-gray-200"
                    )}
                    style={isSelected ? { borderColor: statusColor } : {}}
                  >
                    <div
                      className="w-3 h-3 rounded-full mb-2"
                      style={{ backgroundColor: statusColor }}
                    />
                    <p className="font-bold text-gray-900 text-sm">{table.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{table.status.replace("_", " ")}</p>
                    {activeOrder && (
                      <p className="text-xs font-semibold text-orange-600 mt-2">
                        {activeOrder.status === "READY" ? "🔔 READY" : activeOrder.status}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Status Legend */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { status: "AVAILABLE", label: "Available" },
              { status: "OCCUPIED", label: "Occupied" },
              { status: "PREPARING", label: "Preparing" },
              { status: "READY", label: "Ready to Serve" },
            ].map(({ status, label }) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTableStatusColor(status) }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Order Detail Panel */}
        {selectedTable && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{selectedTable.name}</h3>
                <button onClick={() => setSelectedTable(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <p className="text-sm text-gray-500 capitalize">{selectedTable.status.replace("_", " ")}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {selectedTable.orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">No active orders</p>
                  <p className="text-gray-300 text-xs mt-1">Table is free</p>
                </div>
              ) : (
                selectedTable.orders.map(order => (
                  <div key={order.id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{timeAgo(order.createdAt)}</p>
                      </div>
                      <span className={cn("text-xs px-2 py-1 rounded-full border font-medium", getOrderStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 mb-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium text-gray-800">{item.quantity}× {item.name}</span>
                          {item.addons.length > 0 && (
                            <div className="text-xs text-gray-500 ml-3">{item.addons.map(a => a.name).join(", ")}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="font-bold text-gray-900 mb-3">{formatCurrency(order.totalAmount)}</p>

                    {/* Actions */}
                    <div className="space-y-2">
                      {order.status === "READY" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "SERVED")}
                          className="w-full bg-green-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                        >
                          ✓ Mark as Served
                        </button>
                      )}
                      {order.status === "SERVED" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                          className="w-full bg-gray-800 text-white py-2 rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors"
                        >
                          Complete & Clear Table
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WaiterPage() {
  return (
    <SessionProvider>
      <WaiterContent />
    </SessionProvider>
  );
}
