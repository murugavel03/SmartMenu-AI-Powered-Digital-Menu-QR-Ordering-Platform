import { NextResponse } from "next/server";
import { requireRole, getRestaurantId } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await requireRole(["WAITER", "OWNER", "MANAGER", "SUPER_ADMIN"]);
  const restaurantId = await getRestaurantId(session);
  if (!restaurantId) return NextResponse.json({ error: "No restaurant" }, { status: 403 });

  const tables = await db.table.findMany({
    where: { restaurantId, isActive: true },
    include: {
      orders: {
        where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_SERVICE"] } },
        include: { items: { include: { addons: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ tables });
}
