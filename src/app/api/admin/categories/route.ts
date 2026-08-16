import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validations";

export async function GET() {
  const { restaurantId } = await requireRestaurantAccess();
  const categories = await db.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { menuItems: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const { restaurantId } = await requireRestaurantAccess();
  const body = await req.json();
  const data = categorySchema.parse(body);
  const category = await db.category.create({
    data: { ...data, restaurantId },
  });
  return NextResponse.json({ category }, { status: 201 });
}
