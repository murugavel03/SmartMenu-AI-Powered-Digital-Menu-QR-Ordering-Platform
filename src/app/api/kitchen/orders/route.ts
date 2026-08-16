import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { getRestaurantId } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await requireRole(["CHEF", "KITCHEN", "OWNER", "MANAGER", "SUPER_ADMIN"]);
  const restaurantId = await getRestaurantId(session);
  if (!restaurantId) return NextResponse.json({ error: "No restaurant" }, { status: 403 });

  const orders = await db.order.findMany({
    where: {
      restaurantId,
      status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
    },
    include: {
      items: { include: { addons: true } },
      table: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ orders });
}
