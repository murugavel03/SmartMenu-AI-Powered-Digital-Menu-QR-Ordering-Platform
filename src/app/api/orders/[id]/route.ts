import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { addons: true } },
      table: { select: { name: true } },
      customer: { select: { name: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      restaurant: { select: { name: true, logo: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
