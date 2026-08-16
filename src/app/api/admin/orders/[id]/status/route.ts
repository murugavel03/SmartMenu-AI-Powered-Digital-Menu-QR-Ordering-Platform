import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { updateOrderStatus } from "@/services/orders";
import type { OrderStatus } from "@/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;
  const { status, note } = await req.json();

  const validStatuses: OrderStatus[] = [
    "PENDING", "CONFIRMED", "PREPARING", "READY",
    "OUT_FOR_SERVICE", "SERVED", "COMPLETED", "CANCELLED"
  ];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await updateOrderStatus(id, restaurantId, status, note);
  return NextResponse.json({ order });
}
