/**
 * Pure order logic: turns raw Shopify fields into customer-friendly status,
 * tabs, search, totals, progress steps and updates. No UI imports.
 */
import type {
  Fulfillment,
  FulfillmentEventStatus,
  LineItem,
  Money,
  Order,
  OrderCancelReason,
  OrderFinancialStatus,
  OrderStatus,
  OrderTab,
} from '../features/orders/types';

export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

interface StatusMeta {
  label: string;
  description: string;
  tone: Tone;
  tab: Exclude<OrderTab, 'all'>;
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  awaiting_payment: {
    label: 'Awaiting payment',
    description: 'Waiting for your payment before the store can prepare this order.',
    tone: 'warning',
    tab: 'to_pay',
  },
  processing: {
    label: 'Preparing',
    description: 'The store is preparing your order.',
    tone: 'info',
    tab: 'to_ship',
  },
  partially_shipped: {
    label: 'Partly shipped',
    description: 'Part of your order is on the way. The rest will ship separately.',
    tone: 'info',
    tab: 'to_receive',
  },
  shipped: {
    label: 'Shipped',
    description: 'Your order is on the way.',
    tone: 'info',
    tab: 'to_receive',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    description: 'Your package is out for delivery.',
    tone: 'info',
    tab: 'to_receive',
  },
  delivery_issue: {
    label: 'Delivery issue',
    description: 'The courier couldn’t deliver your package. Check the tracking page or contact the store.',
    tone: 'danger',
    tab: 'to_receive',
  },
  delivered: {
    label: 'Delivered',
    description: 'Your order was delivered.',
    tone: 'success',
    tab: 'completed',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This order was cancelled.',
    tone: 'neutral',
    tab: 'cancelled',
  },
};

export const FINANCIAL_STATUS_META: Record<OrderFinancialStatus, {label: string; tone: Tone}> = {
  PENDING: {label: 'Payment pending', tone: 'warning'},
  AUTHORIZED: {label: 'Payment authorized', tone: 'info'},
  PARTIALLY_PAID: {label: 'Partly paid', tone: 'warning'},
  PAID: {label: 'Paid', tone: 'success'},
  PARTIALLY_REFUNDED: {label: 'Partly refunded', tone: 'neutral'},
  REFUNDED: {label: 'Refunded', tone: 'neutral'},
  VOIDED: {label: 'Voided', tone: 'neutral'},
  EXPIRED: {label: 'Payment expired', tone: 'neutral'},
};

/** Customer-safe wording; internal reasons (fraud, staff) are not exposed verbatim. */
export const CANCEL_REASON_LABEL: Record<OrderCancelReason, string> = {
  CUSTOMER: 'You cancelled this order.',
  DECLINED: 'The payment was declined.',
  INVENTORY: 'Some items were out of stock.',
  FRAUD: 'The store cancelled this order.',
  STAFF: 'The store cancelled this order.',
  OTHER: 'The store cancelled this order.',
};

export const SHIPMENT_EVENT_META: Record<FulfillmentEventStatus, {label: string; problem?: boolean}> = {
  LABEL_PURCHASED: {label: 'Shipping label created'},
  LABEL_PRINTED: {label: 'Shipping label created'},
  CONFIRMED: {label: 'Shipment confirmed'},
  READY_FOR_PICKUP: {label: 'Ready for pickup'},
  CARRIER_PICKED_UP: {label: 'Picked up by courier'},
  IN_TRANSIT: {label: 'In transit'},
  OUT_FOR_DELIVERY: {label: 'Out for delivery'},
  ATTEMPTED_DELIVERY: {label: 'Delivery attempted', problem: true},
  DELAYED: {label: 'Delayed', problem: true},
  FAILURE: {label: 'Delivery failed', problem: true},
  DELIVERED: {label: 'Delivered'},
  PICKED_UP: {label: 'Picked up'},
};

const DONE_STATUSES: FulfillmentEventStatus[] = ['DELIVERED', 'PICKED_UP'];
const PROBLEM_STATUSES: FulfillmentEventStatus[] = ['ATTEMPTED_DELIVERY', 'FAILURE'];

/** Fulfillments that represent a real shipment (cancelled or failed records excluded). */
export function activeFulfillments(order: Order): Fulfillment[] {
  return order.fulfillments.filter(
    (f) => f.status !== 'CANCELLED' && f.status !== 'FAILURE' && f.status !== 'ERROR',
  );
}

export function getOrderStatus(order: Order): OrderStatus {
  if (order.cancelledAt) return 'cancelled';

  const shipments = activeFulfillments(order);
  if (shipments.length === 0) {
    const unpaid = order.financialStatus === 'PENDING' || order.financialStatus === 'PARTIALLY_PAID';
    const untouched = order.fulfillmentStatus === 'UNFULFILLED' || order.fulfillmentStatus === 'OPEN';
    return unpaid && untouched ? 'awaiting_payment' : 'processing';
  }

  const latest = shipments.map((f) => f.latestShipmentStatus);
  if (latest.some((s) => s && PROBLEM_STATUSES.includes(s))) return 'delivery_issue';
  if (order.fulfillmentStatus === 'PARTIALLY_FULFILLED') return 'partially_shipped';
  if (latest.every((s) => s && DONE_STATUSES.includes(s))) return 'delivered';
  if (latest.includes('OUT_FOR_DELIVERY')) return 'out_for_delivery';
  return 'shipped';
}

export function getOrderTab(order: Order): Exclude<OrderTab, 'all'> {
  return ORDER_STATUS_META[getOrderStatus(order)].tab;
}

export interface TabDefinition {
  id: OrderTab;
  label: string;
}

export function getTabs(options: {showToPayTab: boolean}): TabDefinition[] {
  const tabs: TabDefinition[] = [
    {id: 'all', label: 'All'},
    {id: 'to_pay', label: 'To Pay'},
    {id: 'to_ship', label: 'To Ship'},
    {id: 'to_receive', label: 'To Receive'},
    {id: 'completed', label: 'Completed'},
    {id: 'cancelled', label: 'Cancelled'},
  ];
  return options.showToPayTab ? tabs : tabs.filter((t) => t.id !== 'to_pay');
}

const normalize = (s: string) => s.toLowerCase().replace(/#/g, '').trim();

/** Matches by order number (with or without "#") or any product/variant title. */
export function matchesQuery(order: Order, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  if (normalize(order.name).includes(q)) return true;
  return order.lineItems.some(
    (li) => normalize(li.title).includes(q) || normalize(li.variantTitle ?? '').includes(q),
  );
}

export function filterOrders(orders: Order[], tab: OrderTab, query: string): Order[] {
  return orders.filter((o) => (tab === 'all' || getOrderTab(o) === tab) && matchesQuery(o, query));
}

export function countByTab(orders: Order[]): Record<OrderTab, number> {
  const counts: Record<OrderTab, number> = {
    all: orders.length,
    to_pay: 0,
    to_ship: 0,
    to_receive: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const order of orders) counts[getOrderTab(order)] += 1;
  return counts;
}

export function totalQuantity(order: Order): number {
  return order.lineItems.reduce((sum, li) => sum + li.quantity, 0);
}

/** Item totals before discounts, total discounts, in the order's currency. */
export function priceBreakdown(order: Order): {items: Money; discount: Money} {
  const currencyCode = order.totalPrice.currencyCode;
  const sum = (pick: (li: LineItem) => number) =>
    Math.round(order.lineItems.reduce((acc, li) => acc + pick(li), 0) * 100) / 100;
  return {
    items: {amount: sum((li) => li.totalPrice?.amount ?? 0), currencyCode},
    discount: {amount: sum((li) => li.totalDiscount.amount), currencyCode},
  };
}

/** Earliest estimated delivery across shipments still on the way, if the carrier provided one. */
export function estimatedDelivery(order: Order): string | null {
  const estimates = activeFulfillments(order)
    .filter((f) => !(f.latestShipmentStatus && DONE_STATUSES.includes(f.latestShipmentStatus)))
    .map((f) => f.estimatedDeliveryAt)
    .filter((d): d is string => Boolean(d))
    .sort();
  return estimates[0] ?? null;
}

/** Line items (with remaining quantity) not covered by any shipment yet. */
export function unshippedItems(order: Order): {item: LineItem; quantity: number}[] {
  if (order.cancelledAt) return [];
  const shipped = new Map<string, number>();
  for (const f of activeFulfillments(order)) {
    for (const fli of f.fulfillmentLineItems) {
      shipped.set(fli.lineItem.id, (shipped.get(fli.lineItem.id) ?? 0) + (fli.quantity ?? 0));
    }
  }
  return order.lineItems
    .map((item) => ({item, quantity: item.quantity - (shipped.get(item.id) ?? 0)}))
    .filter((x) => x.quantity > 0);
}

// ---------------------------------------------------------------------------
// Progress steps and update history
// ---------------------------------------------------------------------------

export type StepState = 'complete' | 'unrecorded' | 'upcoming';

export interface ProgressStep {
  key: string;
  label: string;
  state: StepState;
  /** Only set when Shopify provides a timestamp for this step. */
  at?: string;
}

const STEP_CAP: Record<Exclude<OrderStatus, 'cancelled'>, number> = {
  awaiting_payment: 0,
  processing: 0,
  partially_shipped: 1,
  shipped: 1,
  out_for_delivery: 2,
  delivery_issue: 2,
  delivered: 3,
};

function earliest(times: string[]): string | undefined {
  return [...times].sort()[0];
}

/**
 * Four simple steps: Ordered → Shipped → Out for delivery → Delivered.
 * A step gets a time only if Shopify recorded one; returns null for cancelled orders.
 */
export function buildProgress(order: Order): ProgressStep[] | null {
  const status = getOrderStatus(order);
  if (status === 'cancelled') return null;

  const shipments = activeFulfillments(order);
  const events = shipments.flatMap((f) => f.events);
  const eventTime = (statuses: FulfillmentEventStatus[]) =>
    earliest(events.filter((e) => statuses.includes(e.status)).map((e) => e.happenedAt));

  const steps = [
    {key: 'ordered', label: 'Ordered', at: order.processedAt},
    {key: 'shipped', label: 'Shipped', at: earliest(shipments.map((f) => f.createdAt))},
    {key: 'out_for_delivery', label: 'Out for delivery', at: eventTime(['OUT_FOR_DELIVERY'])},
    {key: 'delivered', label: 'Delivered', at: eventTime(DONE_STATUSES)},
  ];
  const reached = STEP_CAP[status];

  return steps.map((s, i) => {
    if (i > reached) return {key: s.key, label: s.label, state: 'upcoming'};
    return s.at
      ? {key: s.key, label: s.label, state: 'complete', at: s.at}
      : {key: s.key, label: s.label, state: 'unrecorded'};
  });
}

export interface OrderUpdate {
  id: string;
  label: string;
  at: string;
  problem: boolean;
  /** 1-based shipment number when the order has more than one shipment. */
  shipment?: number;
}

/** Every timestamped fact Shopify gives us about the order, newest first. */
export function buildUpdates(order: Order): OrderUpdate[] {
  const shipments = activeFulfillments(order);
  const multi = shipments.length > 1;
  const updates: OrderUpdate[] = [
    {id: 'placed', label: 'Order placed', at: order.processedAt, problem: false},
  ];

  shipments.forEach((f, i) => {
    const shipment = multi ? i + 1 : undefined;
    updates.push({id: `${f.id}-created`, label: 'Shipped', at: f.createdAt, problem: false, shipment});
    for (const e of f.events) {
      const meta = SHIPMENT_EVENT_META[e.status];
      updates.push({id: e.id, label: meta.label, at: e.happenedAt, problem: Boolean(meta.problem), shipment});
    }
  });

  if (order.cancelledAt) {
    updates.push({id: 'cancelled', label: 'Order cancelled', at: order.cancelledAt, problem: true});
  }

  return updates.sort((a, b) => b.at.localeCompare(a.at));
}
