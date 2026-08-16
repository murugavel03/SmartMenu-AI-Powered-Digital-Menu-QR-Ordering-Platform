import { db } from "@/lib/db";

export async function getPublicMenu(restaurantSlug: string) {
  const restaurant = await db.restaurant.findUnique({
    where: { slug: restaurantSlug, isActive: true },
    include: {
      settings: true,
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          menuItems: {
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
            include: {
              variants: { orderBy: { price: "asc" } },
              addons: { orderBy: { name: "asc" } },
            },
          },
        },
      },
    },
  });

  return restaurant;
}

export async function getAdminMenu(restaurantId: string) {
  return db.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" },
    include: {
      menuItems: {
        orderBy: { sortOrder: "asc" },
        include: {
          variants: true,
          addons: true,
        },
      },
    },
  });
}
