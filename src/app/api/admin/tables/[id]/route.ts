import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tableSchema } from "@/lib/validations";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;
  const existing = await db.table.findFirst({ where: { id, restaurantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data = tableSchema.parse(body);
  const table = await db.table.update({ where: { id }, data });
  return NextResponse.json({ table });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;
  const existing = await db.table.findFirst({ where: { id, restaurantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.table.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
