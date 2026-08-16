import { NextResponse } from "next/server";
import { requireRestaurantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { restaurantId } = await requireRestaurantAccess();
  const { id } = await params;
  const { items: approvedItems } = await req.json();

  const menuImport = await db.menuImport.findFirst({
    where: { id, restaurantId },
  });
  if (!menuImport) return NextResponse.json({ error: "Import not found" }, { status: 404 });

  // Group by category
  const categoryMap = new Map<string, typeof approvedItems>();
  for (const item of approvedItems) {
    if (!categoryMap.has(item.categoryName)) {
      categoryMap.set(item.categoryName, []);
    }
    categoryMap.get(item.categoryName)!.push(item);
  }

  let createdCount = 0;

  for (const [categoryName, items] of categoryMap.entries()) {
    // Find or create category
    let category = await db.category.findFirst({
      where: { restaurantId, name: categoryName },
    });

    if (!category) {
      category = await db.category.create({
        data: { restaurantId, name: categoryName, sortOrder: 0 },
      });
    }

    // Create menu items
    for (const item of items) {
      const created = await db.menuItem.create({
        data: {
          restaurantId,
          categoryId: category.id,
          name: item.name,
          description: item.description,
          price: item.price ?? 0,
          isVegetarian: item.isVegetarian ?? false,
          spiceLevel: item.spiceLevel ?? "NONE",
          variants: item.variants?.length
            ? { create: item.variants }
            : undefined,
          addons: item.addons?.length
            ? { create: item.addons }
            : undefined,
        },
      });

      await db.menuImportItem.updateMany({
        where: { importId: id, name: item.name },
        data: { menuItemId: created.id, isApproved: true },
      });

      createdCount++;
    }
  }

  await db.menuImport.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  return NextResponse.json({ success: true, createdCount });
}
