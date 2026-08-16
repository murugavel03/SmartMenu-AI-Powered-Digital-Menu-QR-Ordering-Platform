import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMenuParser } from "@/lib/ai";

export async function POST(req: Request) {
  const { restaurantId } = await requireRestaurantAccess();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Create import record
    const menuImport = await db.menuImport.create({
      data: {
        restaurantId,
        fileName: file.name,
        fileUrl: "",
        fileType: file.type,
        status: "PROCESSING",
      },
    });

    // Extract menu using AI
    const parser = getMenuParser();
    const buffer = Buffer.from(await file.arrayBuffer());

    let extracted;
    if (file.type === "application/pdf") {
      extracted = await parser.extractMenuFromPDF(buffer);
    } else {
      const base64 = buffer.toString("base64");
      extracted = await parser.extractMenuFromImage(base64, file.type);
    }

    // Save extracted items
    const importItems = [];
    for (const category of extracted.categories) {
      for (const item of category.items) {
        const importItem = await db.menuImportItem.create({
          data: {
            importId: menuImport.id,
            categoryName: category.name,
            name: item.name,
            description: item.description,
            price: item.price,
            isVegetarian: item.isVegetarian ?? false,
            spiceLevel: item.spiceLevel ?? "NONE",
            variants: item.variants as never,
            addons: item.addons as never,
            rawData: item as never,
          },
        });
        importItems.push(importItem);
      }
    }

    await db.menuImport.update({
      where: { id: menuImport.id },
      data: { status: "COMPLETED", rawData: extracted as never },
    });

    return NextResponse.json({
      importId: menuImport.id,
      categories: extracted.categories,
      itemCount: importItems.length,
    });
  } catch (err) {
    console.error("Menu import error:", err);
    return NextResponse.json(
      { error: "Failed to process menu. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { restaurantId } = await requireRestaurantAccess();
  const imports = await db.menuImport.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ imports });
}
