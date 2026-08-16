import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { generateQRCodeDataURL, generateQRCodeSVG, buildTableQRUrl } from "@/lib/qr/generator";

export async function GET(req: Request, { params }: { params: Promise<{ tableId: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { tableId } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "png";

  const qrCode = await db.qRCode.findFirst({
    where: { tableId, restaurantId },
    include: { table: true },
  });
  if (!qrCode) return NextResponse.json({ error: "QR code not found" }, { status: 404 });

  if (format === "svg") {
    const svg = await generateQRCodeSVG(qrCode.url);
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
  }

  return NextResponse.json({ qrCode });
}

export async function POST(req: Request, { params }: { params: Promise<{ tableId: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { tableId } = await params;

  const table = await db.table.findFirst({ where: { id: tableId, restaurantId }, include: { qrCode: true } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const restaurant = await db.restaurant.findUnique({ where: { id: restaurantId }, select: { slug: true } });

  let qrRecord = table.qrCode;
  if (!qrRecord) {
    qrRecord = await db.qRCode.create({ data: { restaurantId, tableId, url: "" } });
  }

  const url = buildTableQRUrl(restaurant!.slug, qrRecord.code);
  const qrImage = await generateQRCodeDataURL(url, { size: 400 });

  const updated = await db.qRCode.update({
    where: { id: qrRecord.id },
    data: { url, qrImageUrl: qrImage },
  });

  return NextResponse.json({ qrCode: updated });
}
