import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { menuItemSchema } from "@/lib/validations";

export async function GET() {
  const { restaurantId } = await requireRestaurantAccess();
  const items = await db.menuItem.findMany({
    where: { restaurantId },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
    include: {
      category: { select: { id: true, name: true } },
      variants: true,
      addons: true,
    },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { restaurantId } = await requireRestaurantAccess();
  const body = await req.json();
  const { variants, addons, ...itemData } = body;
  const data = menuItemSchema.parse(itemData);

  const item = await db.menuItem.create({
    data: {
      ...data,
      restaurantId,
      variants: variants?.length ? { create: variants } : undefined,
      addons: addons?.length ? { create: addons } : undefined,
    },
    include: { variants: true, addons: true, category: true },
  });

  return NextResponse.json({ item }, { status: 201 });
}
