"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ tableCode: string }>;
}

export default async function TableQRPage({ params }: Props) {
  const { tableCode } = await params;

  const qrCode = await db.qRCode.findUnique({
    where: { code: tableCode },
    include: {
      restaurant: { select: { slug: true, isActive: true } },
      table: { select: { id: true, isActive: true } },
    },
  });

  if (!qrCode || !qrCode.restaurant.isActive || !qrCode.table.isActive) {
    redirect("/not-found");
  }

  redirect(`/menu/${qrCode.restaurant.slug}?table=${qrCode.tableId}`);
}
