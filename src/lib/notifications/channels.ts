export const CHANNELS = {
  restaurant: (id: string) => `private-restaurant-${id}`,
  kitchen: (id: string) => `private-kitchen-${id}`,
  waiter: (id: string) => `private-waiter-${id}`,
  order: (id: string) => `private-order-${id}`,
};

export const EVENTS = {
  ORDER_CREATED: "order.created",
  ORDER_STATUS_CHANGED: "order.status_changed",
  ORDER_READY: "order.ready",
  TABLE_STATUS_CHANGED: "table.status_changed",
};
