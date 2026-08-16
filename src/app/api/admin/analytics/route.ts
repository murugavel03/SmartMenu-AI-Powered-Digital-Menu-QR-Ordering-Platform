import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { getDashboardStats, getRevenueChart, getPopularItems } from "@/services/analytics";

export async function GET(req: Request) {
  const { restaurantId } = await requireRestaurantAccess();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "stats";

  if (type === "stats") {
    const stats = await getDashboardStats(restaurantId);
    return NextResponse.json({ stats });
  }

  if (type === "revenue") {
    const days = parseInt(searchParams.get("days") || "7");
    const chart = await getRevenueChart(restaurantId, days);
    return NextResponse.json({ chart });
  }

  if (type === "popular") {
    const items = await getPopularItems(restaurantId);
    return NextResponse.json({ items });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
