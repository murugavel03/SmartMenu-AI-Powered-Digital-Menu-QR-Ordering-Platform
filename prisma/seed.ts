import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SmartMenu database (SQLite)...");

  // Create Owner
  const hashedPassword = await bcrypt.hash("Demo@1234", 12);

  const owner = await prisma.user.upsert({
    where: { email: "owner@spicegarden.com" },
    update: {},
    create: {
      name: "Rajesh Kumar",
      email: "owner@spicegarden.com",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  // Create Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "spice-garden" },
    update: {},
    create: {
      slug: "spice-garden",
      name: "Spice Garden",
      description: "Authentic North & South Indian cuisine with a modern twist. Experience the rich flavors of India.",
      phone: "+91 98765 43210",
      email: "info@spicegarden.com",
      address: "123 MG Road",
      city: "Bangalore",
      country: "India",
      isOpen: true,
      ownerId: owner.id,
      settings: {
        create: {
          currency: "INR",
          currencySymbol: "Rs.",
          taxPercentage: 5,
          serviceCharge: 0,
          theme: "INDIAN",
          primaryColor: "#dc2626",
          accentColor: "#f59e0b",
          estimatedPrepTime: 20,
          openingHours: JSON.stringify({
            monday: { open: "11:00", close: "23:00" },
            tuesday: { open: "11:00", close: "23:00" },
            wednesday: { open: "11:00", close: "23:00" },
            thursday: { open: "11:00", close: "23:00" },
            friday: { open: "11:00", close: "23:59" },
            saturday: { open: "11:00", close: "23:59" },
            sunday: { open: "12:00", close: "22:00" },
          }),
        },
      },
    },
  });

  // Create Staff
  const kitchenUser = await prisma.user.upsert({
    where: { email: "kitchen@spicegarden.com" },
    update: {},
    create: {
      name: "Ramu Chef",
      email: "kitchen@spicegarden.com",
      password: hashedPassword,
      role: "KITCHEN",
    },
  });

  const waiterUser = await prisma.user.upsert({
    where: { email: "waiter@spicegarden.com" },
    update: {},
    create: {
      name: "Suresh Waiter",
      email: "waiter@spicegarden.com",
      password: hashedPassword,
      role: "WAITER",
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@spicegarden.com" },
    update: {},
    create: {
      name: "Priya Manager",
      email: "manager@spicegarden.com",
      password: hashedPassword,
      role: "MANAGER",
    },
  });

  // Upsert staff records
  for (const { user, role } of [
    { user: kitchenUser, role: "KITCHEN" },
    { user: waiterUser, role: "WAITER" },
    { user: managerUser, role: "MANAGER" },
  ]) {
    await prisma.restaurantStaff.upsert({
      where: { userId: user.id },
      update: {},
      create: { restaurantId: restaurant.id, userId: user.id, role },
    });
  }

  // Categories
  const categoryData = [
    { name: "Starters", sortOrder: 1 },
    { name: "North Indian", sortOrder: 2 },
    { name: "South Indian", sortOrder: 3 },
    { name: "Breads", sortOrder: 4 },
    { name: "Rice & Biryani", sortOrder: 5 },
    { name: "Desserts", sortOrder: 6 },
    { name: "Beverages", sortOrder: 7 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const existing = await prisma.category.findFirst({
      where: { restaurantId: restaurant.id, name: cat.name },
    });
    if (existing) {
      categories[cat.name] = existing.id;
    } else {
      const created = await prisma.category.create({
        data: { restaurantId: restaurant.id, ...cat },
      });
      categories[cat.name] = created.id;
    }
  }

  // Menu Items
  const menuItems = [
    // Starters
    { name: "Paneer Tikka", description: "Grilled cottage cheese with Indian spices, served with mint chutney", price: 249, isVegetarian: true, spiceLevel: "MEDIUM", categoryName: "Starters", isFeatured: true, isPopular: true,
      variants: [{ name: "Half Plate", price: 149, isDefault: false }, { name: "Full Plate", price: 249, isDefault: true }],
      addons: [{ name: "Extra Chutney", price: 20, isRequired: false }, { name: "Extra Spicy", price: 0, isRequired: false }]
    },
    { name: "Chicken Tikka", description: "Tender chicken pieces grilled in tandoor with aromatic spices", price: 299, isVegetarian: false, spiceLevel: "HOT", categoryName: "Starters", isPopular: true,
      variants: [{ name: "Half Plate", price: 199, isDefault: false }, { name: "Full Plate", price: 299, isDefault: true }]
    },
    { name: "Veg Spring Rolls", description: "Crispy rolls filled with mixed vegetables and noodles", price: 149, isVegetarian: true, spiceLevel: "MILD", categoryName: "Starters" },
    { name: "Hara Bhara Kabab", description: "Spinach and peas patties with cottage cheese filling", price: 179, isVegetarian: true, spiceLevel: "MILD", categoryName: "Starters" },

    // North Indian
    { name: "Butter Chicken", description: "Tender chicken in rich tomato-based creamy sauce", price: 349, isVegetarian: false, spiceLevel: "MEDIUM", categoryName: "North Indian", isFeatured: true, isPopular: true,
      variants: [{ name: "Half", price: 229, isDefault: false }, { name: "Full", price: 349, isDefault: true }],
      addons: [{ name: "Extra Gravy", price: 40, isRequired: false }]
    },
    { name: "Dal Makhani", description: "Black lentils slow-cooked overnight with butter and cream", price: 199, isVegetarian: true, spiceLevel: "MILD", categoryName: "North Indian", isPopular: true,
      addons: [{ name: "Extra Butter", price: 30, isRequired: false }]
    },
    { name: "Palak Paneer", description: "Fresh cottage cheese cubes in smooth spinach gravy", price: 249, isVegetarian: true, spiceLevel: "MILD", categoryName: "North Indian" },
    { name: "Shahi Paneer", description: "Cottage cheese in rich Mughlai cream sauce with cashews", price: 279, isVegetarian: true, spiceLevel: "NONE", categoryName: "North Indian" },
    { name: "Mutton Rogan Josh", description: "Slow-cooked mutton in Kashmiri spices and yogurt", price: 449, isVegetarian: false, spiceLevel: "HOT", categoryName: "North Indian", isFeatured: true },

    // South Indian
    { name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling, served with sambar and chutney", price: 129, isVegetarian: true, spiceLevel: "MILD", categoryName: "South Indian", isPopular: true },
    { name: "Idli Sambar", description: "Steamed rice cakes with lentil soup and coconut chutney (4 pieces)", price: 89, isVegetarian: true, spiceLevel: "NONE", categoryName: "South Indian" },
    { name: "Uttapam", description: "Thick pancake topped with onions, tomatoes, and green chilies", price: 119, isVegetarian: true, spiceLevel: "MILD", categoryName: "South Indian" },

    // Breads
    { name: "Butter Naan", description: "Soft leavened bread baked in tandoor with butter", price: 40, isVegetarian: true, spiceLevel: "NONE", categoryName: "Breads" },
    { name: "Garlic Naan", description: "Naan bread topped with garlic and fresh coriander", price: 50, isVegetarian: true, spiceLevel: "NONE", categoryName: "Breads", isPopular: true },
    { name: "Tandoori Roti", description: "Whole wheat bread baked in clay oven", price: 25, isVegetarian: true, spiceLevel: "NONE", categoryName: "Breads" },
    { name: "Peshwari Naan", description: "Sweet naan filled with almonds, coconut, and raisins", price: 65, isVegetarian: true, spiceLevel: "NONE", categoryName: "Breads" },

    // Rice & Biryani
    { name: "Chicken Biryani", description: "Fragrant basmati rice with tender chicken, saffron, and fried onions", price: 349, isVegetarian: false, spiceLevel: "MEDIUM", categoryName: "Rice & Biryani", isFeatured: true, isPopular: true,
      variants: [{ name: "Half", price: 229, isDefault: false }, { name: "Full", price: 349, isDefault: true }]
    },
    { name: "Veg Biryani", description: "Aromatic basmati rice cooked with seasonal vegetables and whole spices", price: 249, isVegetarian: true, spiceLevel: "MEDIUM", categoryName: "Rice & Biryani" },
    { name: "Jeera Rice", description: "Basmati rice tempered with cumin seeds and ghee", price: 99, isVegetarian: true, spiceLevel: "NONE", categoryName: "Rice & Biryani" },

    // Desserts
    { name: "Gulab Jamun", description: "Soft milk solid balls in rose-flavored sugar syrup (2 pieces)", price: 89, isVegetarian: true, spiceLevel: "NONE", categoryName: "Desserts" },
    { name: "Kulfi Falooda", description: "Indian ice cream with vermicelli, rose syrup, and basil seeds", price: 149, isVegetarian: true, spiceLevel: "NONE", categoryName: "Desserts", isPopular: true },
    { name: "Gajar Ka Halwa", description: "Carrot pudding cooked in milk and ghee, garnished with nuts", price: 119, isVegetarian: true, spiceLevel: "NONE", categoryName: "Desserts" },

    // Beverages
    { name: "Mango Lassi", description: "Chilled yogurt drink blended with fresh Alphonso mangoes", price: 99, isVegetarian: true, spiceLevel: "NONE", categoryName: "Beverages", isPopular: true },
    { name: "Masala Chai", description: "Traditional spiced Indian tea with milk", price: 49, isVegetarian: true, spiceLevel: "NONE", categoryName: "Beverages",
      variants: [{ name: "Regular", price: 49, isDefault: true }, { name: "Large", price: 69, isDefault: false }]
    },
    { name: "Fresh Lime Soda", description: "Refreshing lime with soda water, sweet or salty", price: 79, isVegetarian: true, spiceLevel: "NONE", categoryName: "Beverages",
      variants: [{ name: "Sweet", price: 79, isDefault: false }, { name: "Salty", price: 79, isDefault: false }, { name: "Mixed", price: 79, isDefault: true }]
    },
    { name: "Watermelon Juice", description: "Fresh watermelon blended with a hint of ginger and black salt", price: 89, isVegetarian: true, spiceLevel: "NONE", categoryName: "Beverages" },
  ];

  for (const item of menuItems) {
    const { categoryName, variants, addons, ...itemData } = item;
    const catId = categories[categoryName];
    if (!catId) continue;

    const existing = await prisma.menuItem.findFirst({
      where: { restaurantId: restaurant.id, name: itemData.name },
    });
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          ...itemData,
          restaurantId: restaurant.id,
          categoryId: catId,
          variants: variants ? { create: variants } : undefined,
          addons: addons ? { create: addons } : undefined,
        },
      });
    }
  }

  // Tables
  for (let i = 1; i <= 10; i++) {
    const tableName = i <= 8 ? `Table ${i}` : i === 9 ? "VIP Table" : "Outdoor Table";
    
    const table = await prisma.table.upsert({
      where: { id: `seed-table-${i}` },
      update: {},
      create: {
        id: `seed-table-${i}`,
        restaurantId: restaurant.id,
        name: tableName,
        capacity: i === 9 ? 8 : i === 10 ? 6 : 4,
        status: "AVAILABLE",
      },
    });

    const existing = await prisma.qRCode.findUnique({ where: { tableId: table.id } });
    if (!existing) {
      const qr = await prisma.qRCode.create({
        data: {
          restaurantId: restaurant.id,
          tableId: table.id,
          url: `http://localhost:3000/t/placeholder`,
        },
      });
      // Import the dynamic path function manually since we don't have generator.js in scope here easily
      const url = `http://localhost:3000/menu/spice-garden?table=${table.id}`;
      await prisma.qRCode.update({ where: { id: qr.id }, data: { url } });
    }
  }

  console.log("✅ Seed complete!");
  console.log("\n📝 Demo Credentials:");
  console.log("  Owner:   owner@spicegarden.com / Demo@1234");
  console.log("  Manager: manager@spicegarden.com / Demo@1234");
  console.log("  Kitchen: kitchen@spicegarden.com / Demo@1234");
  console.log("  Waiter:  waiter@spicegarden.com / Demo@1234");
  console.log("\n🍽️  Restaurant menu: http://localhost:3000/menu/spice-garden");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
