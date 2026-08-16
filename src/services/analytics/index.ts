import { db } from "@/lib/db";

export async function getDashboardStats(restaurantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayOrdersData,
    pendingOrders,
    preparingOrders,
    completedOrders,
  ] = await Promise.all([
    db.order.findMany({
      where: { restaurantId, createdAt: { gte: today } },
      select: { totalAmount: true, status: true },
    }),
    db.order.count({ where: { restaurantId, status: "PENDING" } }),
    db.order.count({ where: { restaurantId, status: "PREPARING" } }),
    db.order.count({
      where: { restaurantId, status: "COMPLETED", createdAt: { gte: today } },
    }),
  ]);

  const todayRevenue = todayOrdersData.reduce((s, o) => s + o.totalAmount, 0);
  const todayOrders = todayOrdersData.length;
  const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

  return {
    todayOrders,
    todayRevenue,
    pendingOrders,
    preparingOrders,
    completedOrders,
    avgOrderValue,
  };
}

export async function getRevenueChart(restaurantId: string, days: number = 7) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const orders = await db.order.findMany({
    where: {
      restaurantId,
      createdAt: { gte: start },
      status: { not: "CANCELLED" },
    },
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped: Record<string, number> = {};
  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    grouped[key] = 0;
  }

  orders.forEach((o) => {
    const key = o.createdAt.toISOString().split("T")[0];
    if (grouped[key] !== undefined) grouped[key] += o.totalAmount;
  });

  return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
}

export async function getPopularItems(restaurantId: string, limit: number = 10) {
  const items = await db.orderItem.groupBy({
    by: ["name"],
    where: { order: { restaurantId, status: { not: "CANCELLED" } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  return items.map((i) => ({
    name: i.name,
    count: i._sum.quantity ?? 0,
  }));
}
