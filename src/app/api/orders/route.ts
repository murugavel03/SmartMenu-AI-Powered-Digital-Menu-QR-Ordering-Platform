import { NextResponse } from "next/server";
import { createOrder } from "@/services/orders";
import { orderSchema } from "@/lib/validations";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { restaurantId, ...orderData } = body;

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
  }

  // Validate restaurantId exists
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId, isActive: true },
  });
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const parsed = orderSchema.parse(orderData);

  const order = await createOrder({ restaurantId, ...parsed });
  return NextResponse.json({ order }, { status: 201 });
}
