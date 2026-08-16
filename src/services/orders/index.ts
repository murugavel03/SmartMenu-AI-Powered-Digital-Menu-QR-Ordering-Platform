import { db } from '@/lib/db';
import { generateOrderNumber } from '@/lib/utils';
import { triggerOrderCreated, triggerOrderStatusChanged } from '@/lib/notifications/pusher-server';
import type { OrderStatus } from '@/types';

interface CreateOrderParams {
  restaurantId: string;
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
  items: {
    menuItemId: string;
    variantId?: string;
    quantity: number;
    selectedAddons: string[];
    instructions?: string;
  }[];
}

export async function createOrder(params: CreateOrderParams) {
  const { restaurantId, tableId, customerName, customerPhone, specialInstructions, items } = params;

  // Validate restaurant
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId, isActive: true },
    include: { settings: true },
  });
  if (!restaurant) throw new Error('Restaurant not found');

  // Load menu items
  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds }, restaurantId, isAvailable: true },
    include: { variants: true, addons: true },
  });

  if (menuItems.length !== menuItemIds.length) {
    throw new Error('Some items are unavailable');
  }

  // Calculate totals
  let subtotal = 0;
  const orderItemsData = items.map((item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
    const variant = item.variantId
      ? menuItem.variants.find((v) => v.id === item.variantId)
      : menuItem.variants.find((v) => v.isDefault);

    const basePrice = variant?.price ?? menuItem.price;
    const addons = menuItem.addons.filter((a) => item.selectedAddons.includes(a.id));
    const addonTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePrice + addonTotal;
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    return {
      menuItemId: item.menuItemId,
      variantId: item.variantId,
      name: menuItem.name,
      variantName: variant?.name,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      instructions: item.instructions,
      addons: addons.map((a) => ({ addonId: a.id, name: a.name, price: a.price })),
    };
  });

  const taxRate = (restaurant.settings?.taxPercentage ?? 0) / 100;
  const serviceRate = (restaurant.settings?.serviceCharge ?? 0) / 100;
  const taxAmount = subtotal * taxRate;
  const serviceCharge = subtotal * serviceRate;
  const totalAmount = subtotal + taxAmount + serviceCharge;

  // Create or find customer
  let customerId: string | undefined;
  if (customerName || customerPhone) {
    const customer = await db.customer.create({
      data: { name: customerName, phone: customerPhone },
    });
    customerId = customer.id;
  }

  // Create order
  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      restaurantId,
      tableId,
      customerId,
      status: 'PENDING',
      subtotal,
      taxAmount,
      serviceCharge,
      totalAmount,
      specialInstructions,
      estimatedTime: restaurant.settings?.estimatedPrepTime ?? 20,
      items: {
        create: orderItemsData.map((item) => ({
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          name: item.name,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          instructions: item.instructions,
          addons: {
            create: item.addons,
          },
        })),
      },
      statusHistory: {
        create: [{ status: 'PENDING', note: 'Order placed by customer' }],
      },
    },
    include: {
      items: { include: { addons: true } },
      table: { select: { id: true, name: true } },
      customer: { select: { name: true, phone: true } },
      statusHistory: true,
    },
  });

  // Update table status
  if (tableId) {
    await db.table.update({
      where: { id: tableId },
      data: { status: 'ORDERING' },
    });
  }

  // Real-time notification
  try {
    await triggerOrderCreated(restaurantId, {
      id: order.id,
      orderNumber: order.orderNumber,
      tableName: order.table?.name,
      itemCount: order.items.length,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    });
  } catch (e) {
    console.error('Pusher notification failed:', e);
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  restaurantId: string,
  status: OrderStatus,
  note?: string
) {
  const order = await db.order.findFirst({
    where: { id: orderId, restaurantId },
  });
  if (!order) throw new Error('Order not found');

  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      status,
      statusHistory: {
        create: [{ status, note }],
      },
    },
    include: {
      items: { include: { addons: true } },
      table: { select: { id: true, name: true } },
      customer: { select: { name: true, phone: true } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });

  // Update table status based on order status
  if (order.tableId) {
    const tableStatus =
      status === 'COMPLETED' || status === 'CANCELLED'
        ? 'AVAILABLE'
        : status === 'READY'
        ? 'READY'
        : status === 'PREPARING'
        ? 'PREPARING'
        : 'OCCUPIED';

    await db.table.update({
      where: { id: order.tableId },
      data: { status: tableStatus as 'AVAILABLE' | 'READY' | 'PREPARING' | 'OCCUPIED' },
    });
  }

  // Real-time notification
  try {
    await triggerOrderStatusChanged(restaurantId, orderId, status, {
      orderNumber: updated.orderNumber,
      tableName: updated.table?.name,
    });
  } catch (e) {
    console.error('Pusher notification failed:', e);
  }

  return updated;
}

export async function getOrdersByRestaurant(
  restaurantId: string,
  filters?: {
    status?: OrderStatus;
    date?: 'today' | 'yesterday' | 'week';
    tableId?: string;
  }
) {
  const where: Record<string, unknown> = { restaurantId };

  if (filters?.status) where.status = filters.status;
  if (filters?.tableId) where.tableId = filters.tableId;

  if (filters?.date) {
    const now = new Date();
    if (filters.date === 'today') {
      where.createdAt = { gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (filters.date === 'yesterday') {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    } else if (filters.date === 'week') {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      where.createdAt = { gte: start };
    }
  }

  return db.order.findMany({
    where,
    include: {
      items: { include: { addons: true } },
      table: { select: { id: true, name: true } },
      customer: { select: { name: true, phone: true } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}
