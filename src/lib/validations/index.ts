import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  restaurantName: z.string().min(2, 'Restaurant name required'),
});

export const restaurantSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  discountPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  spiceLevel: z.enum(['NONE', 'MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT']).default('NONE'),
  prepTime: z.number().int().positive().optional().nullable(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  allergens: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const tableSchema = z.object({
  name: z.string().min(1, 'Table name is required'),
  capacity: z.number().int().positive().default(4),
});

export const orderSchema = z.object({
  tableId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  specialInstructions: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().positive(),
        selectedAddons: z.array(z.string()).default([]),
        instructions: z.string().optional(),
      })
    )
    .min(1, 'At least one item required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type TableInput = z.infer<typeof tableSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
