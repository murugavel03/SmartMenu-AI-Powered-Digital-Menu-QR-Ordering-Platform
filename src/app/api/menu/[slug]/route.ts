import { NextResponse } from "next/server";
import { getPublicMenu } from "@/services/menu";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await getPublicMenu(slug);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  return NextResponse.json({ restaurant });
}
