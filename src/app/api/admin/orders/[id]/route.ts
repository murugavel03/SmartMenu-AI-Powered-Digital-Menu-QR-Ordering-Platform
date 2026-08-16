import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;

  const order = await db.order.findFirst({
    where: { id, restaurantId },
    include: {
      items: { include: { addons: true } },
      table: true,
      customer: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
