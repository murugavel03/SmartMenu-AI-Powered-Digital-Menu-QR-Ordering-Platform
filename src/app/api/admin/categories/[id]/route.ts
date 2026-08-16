import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validations";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;
  const body = await req.json();
  const data = categorySchema.parse(body);

  // Verify ownership
  const existing = await db.category.findFirst({ where: { id, restaurantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const category = await db.category.update({ where: { id }, data });
  return NextResponse.json({ category });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;

  const existing = await db.category.findFirst({ where: { id, restaurantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
