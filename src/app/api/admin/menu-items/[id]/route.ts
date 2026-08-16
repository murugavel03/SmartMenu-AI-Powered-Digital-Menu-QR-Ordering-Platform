import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { menuItemSchema } from "@/lib/validations";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;
  const item = await db.menuItem.findFirst({
    where: { id, restaurantId },
    include: { variants: true, addons: true, category: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;
  const existing = await db.menuItem.findFirst({ where: { id, restaurantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { variants, addons, ...itemData } = body;
  const data = menuItemSchema.parse(itemData);

  // Delete old variants/addons and recreate
  await db.menuItemVariant.deleteMany({ where: { menuItemId: id } });
  await db.menuItemAddon.deleteMany({ where: { menuItemId: id } });

  const item = await db.menuItem.update({
    where: { id },
    data: {
      ...data,
      variants: variants?.length ? { create: variants } : undefined,
      addons: addons?.length ? { create: addons } : undefined,
    },
    include: { variants: true, addons: true, category: true },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;
  const existing = await db.menuItem.findFirst({ where: { id, restaurantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.menuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
