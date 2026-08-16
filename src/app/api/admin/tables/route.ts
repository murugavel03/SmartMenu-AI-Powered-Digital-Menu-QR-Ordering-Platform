import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tableSchema } from "@/lib/validations";
import { generateQRCodeDataURL, buildTableQRUrl } from "@/lib/qr/generator";

export async function GET() {
  const { restaurantId } = await requireRestaurantAccess();
  const tables = await db.table.findMany({
    where: { restaurantId },
    include: { qrCode: true, _count: { select: { orders: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ tables });
}

export async function POST(req: Request) {
  const { restaurantId } = await requireRestaurantAccess();
  const body = await req.json();
  const data = tableSchema.parse(body);

  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    select: { slug: true },
  });

  const table = await db.table.create({
    data: { ...data, restaurantId },
  });

  // Auto-generate QR code
  const qrCode = await db.qRCode.create({
    data: {
      restaurantId,
      tableId: table.id,
      url: buildTableQRUrl(restaurant!.slug, ""),
    },
  });

  const qrUrl = buildTableQRUrl(restaurant!.slug, qrCode.code);
  const qrImage = await generateQRCodeDataURL(qrUrl);

  await db.qRCode.update({
    where: { id: qrCode.id },
    data: { url: qrUrl, qrImageUrl: qrImage },
  });

  return NextResponse.json({ table: { ...table, qrCode: { ...qrCode, url: qrUrl, qrImageUrl: qrImage } } }, { status: 201 });
}
