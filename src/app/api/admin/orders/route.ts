import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { getOrdersByRestaurant } from "@/services/orders";

export async function GET(req: Request) {
  const { restaurantId } = await requireRestaurantAccess();
  const { searchParams } = new URL(req.url);

  const orders = await getOrdersByRestaurant(restaurantId, {
    status: searchParams.get("status") as never || undefined,
    date: (searchParams.get("date") as "today" | "yesterday" | "week") || undefined,
    tableId: searchParams.get("tableId") || undefined,
  });

  return NextResponse.json({ orders });
}
