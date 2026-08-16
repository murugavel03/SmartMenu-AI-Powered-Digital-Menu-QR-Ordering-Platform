import { NextResponse } from "next/server";
import { requireRole, getRestaurantId } from "@/lib/auth/session";
import { updateOrderStatus } from "@/services/orders";
import type { OrderStatus } from "@/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["CHEF", "KITCHEN", "OWNER", "MANAGER", "SUPER_ADMIN"]);
  const restaurantId = await getRestaurantId(session);
  if (!restaurantId) return NextResponse.json({ error: "No restaurant" }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json();

  const order = await updateOrderStatus(id, restaurantId, status as OrderStatus);
  return NextResponse.json({ order });
}
