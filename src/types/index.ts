export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'WAITER' | 'CHEF' | 'KITCHEN' | 'CUSTOMER';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_SERVICE'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TableStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'ORDERING'
  | 'PREPARING'
  | 'READY'
  | 'WAITING_FOR_SERVICE';

export type SpiceLevel = 'NONE' | 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT';
export type MenuTheme = 'ELEGANT' | 'MODERN' | 'MINIMAL' | 'LUXURY' | 'INDIAN' | 'CAFE';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedVariant?: { id: string; name: string; price: number };
  selectedAddons: { id: string; name: string; price: number }[];
  instructions?: string;
}

export interface MenuItemData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  image?: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: SpiceLevel;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  prepTime?: number | null;
  allergens: string[];
  tags: string[];
  variants: { id: string; name: string; price: number; isDefault: boolean }[];
  addons: { id: string; name: string; price: number; isRequired: boolean }[];
  categoryId: string;
}

export interface CategoryData {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
  menuItems: MenuItemData[];
}

export interface RestaurantData {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  isOpen: boolean;
  settings?: {
    currency: string;
    currencySymbol: string;
    taxPercentage: number;
    serviceCharge: number;
    theme: MenuTheme;
    primaryColor: string;
    accentColor: string;
    estimatedPrepTime: number;
    allowSpecialInstructions: boolean;
    requireCustomerName: boolean;
    requireCustomerPhone: boolean;
  } | null;
  categories: CategoryData[];
}

export interface OrderData {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  specialInstructions?: string | null;
  estimatedTime?: number | null;
  createdAt: string;
  table?: { id: string; name: string } | null;
  customer?: { name?: string | null; phone?: string | null } | null;
  items: OrderItemData[];
  statusHistory: { status: OrderStatus; createdAt: string; note?: string | null }[];
}

export interface OrderItemData {
  id: string;
  name: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  instructions?: string | null;
  addons: { name: string; price: number }[];
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  preparingOrders: number;
  completedOrders: number;
  avgOrderValue: number;
}

export interface ExtractedMenuData {
  categories: {
    name: string;
    items: {
      name: string;
      description?: string;
      price?: number;
      currency?: string;
      isVegetarian?: boolean;
      spiceLevel?: SpiceLevel;
      variants?: { name: string; price: number }[];
      addons?: { name: string; price: number }[];
      allergens?: string[];
    }[];
  }[];
}
