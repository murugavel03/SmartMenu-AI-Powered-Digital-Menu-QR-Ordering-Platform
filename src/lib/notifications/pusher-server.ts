import Pusher from 'pusher';

const globalForPusher = globalThis as unknown as { pusher: Pusher };

export const pusherServer =
  globalForPusher.pusher ||
  new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  });

if (process.env.NODE_ENV !== 'production') globalForPusher.pusher = pusherServer;

export const CHANNELS = {
  restaurant: (id: string) => `private-restaurant-${id}`,
  kitchen: (id: string) => `private-kitchen-${id}`,
  waiter: (id: string) => `private-waiter-${id}`,
  order: (id: string) => `private-order-${id}`,
};

export const EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_READY: 'order.ready',
  TABLE_STATUS_CHANGED: 'table.status_changed',
};

export async function triggerOrderCreated(
  restaurantId: string,
  orderData: unknown
) {
  await pusherServer.trigger(
    [CHANNELS.kitchen(restaurantId), CHANNELS.waiter(restaurantId)],
    EVENTS.ORDER_CREATED,
    orderData
  );
}

export async function triggerOrderStatusChanged(
  restaurantId: string,
  orderId: string,
  status: string,
  orderData: unknown
) {
  await pusherServer.trigger(
    [
      CHANNELS.restaurant(restaurantId),
      CHANNELS.kitchen(restaurantId),
      CHANNELS.waiter(restaurantId),
      CHANNELS.order(orderId),
    ],
    EVENTS.ORDER_STATUS_CHANGED,
    { orderId, status, ...((orderData as object) || {}) }
  );
}
