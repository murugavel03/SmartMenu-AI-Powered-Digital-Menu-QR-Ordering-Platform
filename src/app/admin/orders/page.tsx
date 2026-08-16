"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, Filter, Eye } from "lucide-react";
import { getOrderStatusColor, formatCurrency, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OrderData, OrderStatus } from "@/types";

const STATUSES: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Served", value: "SERVED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, dateFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (dateFilter) params.set("date", dateFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  }

  const filtered = orders.filter(o =>
    !search ||
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    (o.table?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} orders found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-56"
          />
        </div>

        <select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="">All Time</option>
        </select>

        <div className="flex gap-1.5 overflow-x-auto">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                statusFilter === s.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg">No orders found</p>
            <p className="text-sm mt-1">Try changing the filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Table</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Items</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Time</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                      {order.customer?.name && <p className="text-xs text-gray-500">{order.customer.name}</p>}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{order.table?.name || "—"}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{order.items?.length || 0} items</td>
                    <td className="px-4 py-4 font-semibold text-gray-900 text-sm">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-4">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", getOrderStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">{timeAgo(order.createdAt)}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-400 hover:text-orange-600 p-1 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, status) => { updateStatus(id, status); setSelectedOrder(null); }}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }: {
  order: OrderData;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const nextStatus: Record<string, OrderStatus> = {
    PENDING: "CONFIRMED",
    CONFIRMED: "PREPARING",
    PREPARING: "READY",
    READY: "SERVED",
    SERVED: "COMPLETED",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 font-mono">{order.orderNumber}</h2>
            <p className="text-sm text-gray-500">{order.table?.name} • {format(new Date(order.createdAt), "MMM d, h:mm a")}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{item.quantity}× {item.name}</span>
                    {item.variantName && <span className="text-gray-500"> ({item.variantName})</span>}
                    {item.addons?.map((a, j) => (
                      <div key={j} className="text-xs text-gray-500 ml-4">+ {a.name} (+Rs.{a.price})</div>
                    ))}
                    {item.instructions && <div className="text-xs text-gray-400 italic ml-4">"{item.instructions}"</div>}
                  </div>
                  <span className="font-semibold text-gray-900 ml-4">Rs.{item.totalPrice.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
              <div className="space-y-2">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-gray-400 w-20 flex-shrink-0 text-xs">{format(new Date(h.createdAt), "h:mm a")}</span>
                    <span className="text-gray-700">{h.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {nextStatus[order.status] && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus[order.status])}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Mark as {nextStatus[order.status]}
            </button>
          )}
          <button
            onClick={() => onStatusChange(order.id, "CANCELLED")}
            className="w-full border border-red-200 text-red-600 py-2.5 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}
