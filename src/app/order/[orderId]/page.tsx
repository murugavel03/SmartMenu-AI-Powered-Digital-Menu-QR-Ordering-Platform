"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import { CheckCircle, Clock, ChefHat, Truck, Star } from "lucide-react";
import type { OrderData } from "@/types";

const STATUS_STEPS = [
  { status: "PENDING", label: "Order Received", icon: CheckCircle },
  { status: "CONFIRMED", label: "Kitchen Accepted", icon: CheckCircle },
  { status: "PREPARING", label: "Preparing", icon: ChefHat },
  { status: "READY", label: "Ready!", icon: Star },
  { status: "SERVED", label: "Served", icon: Truck },
];

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderData & { restaurant?: { name: string; logo?: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        setOrder(data.order);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 mb-2">Order not found</p>
          <p className="text-gray-500">This order may have been removed</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === order.status);

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        {order.restaurant?.logo ? (
          <img src={order.restaurant.logo} alt="Logo" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3" />
        ) : (
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">🍽️</div>
        )}
        <h1 className="text-xl font-bold text-gray-900">{order.restaurant?.name}</h1>
        <p className="text-sm text-gray-500 font-mono mt-1">{order.orderNumber}</p>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Order Status</h2>
        <div className="space-y-3">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex || ["SERVED", "COMPLETED"].includes(order.status);
            const isCurrent = step.status === order.status;
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  isCompleted || isCurrent ? "bg-orange-500" : "bg-gray-100"
                )}>
                  <Icon className={cn("w-4 h-4", isCompleted || isCurrent ? "text-white" : "text-gray-400")} />
                </div>
                <div className="flex-1">
                  <p className={cn("font-medium text-sm", isCurrent ? "text-orange-600" : isCompleted ? "text-gray-900" : "text-gray-400")}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-orange-500 animate-pulse">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {order.estimatedTime && !["SERVED", "COMPLETED"].includes(order.status) && (
          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              Estimated: {order.estimatedTime}–{(order.estimatedTime || 0) + 5} minutes
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3">Your Order</h2>
        <div className="space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.quantity}× {item.name}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
