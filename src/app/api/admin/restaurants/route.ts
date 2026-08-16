import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { restaurantSchema } from "@/lib/validations";
import slugify from "slugify";

export async function GET() {
  const { restaurantId } = await requireRestaurantAccess();
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    include: { settings: true },
  });
  return NextResponse.json({ restaurant });
}

export async function PUT(req: Request) {
  const { restaurantId } = await requireRestaurantAccess();
  const body = await req.json();
  const data = restaurantSchema.parse(body);

  const restaurant = await db.restaurant.update({
    where: { id: restaurantId },
    data: {
      ...data,
      slug: slugify(data.name, { lower: true, strict: true }),
    },
    include: { settings: true },
  });

  return NextResponse.json({ restaurant });
}
