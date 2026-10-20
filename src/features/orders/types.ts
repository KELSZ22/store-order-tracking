/**
 * Domain types that mirror the Shopify Customer Account API (only fields it
 * actually exposes). Enum values are Shopify's verbatim. GraphQL connections
 * (`edges { node }`) are flattened to arrays; a future API adapter unwraps them.
 *
 * All timestamps are ISO 8601 strings with an explicit UTC offset.
 */

/** Shopify `MoneyV2`. Shopify sends `amount` as a decimal string; the adapter parses it. */
export interface Money {
  amount: number;
  currencyCode: string;
}

/** Shopify `OrderFinancialStatus` (payment state, independent of delivery). */
export type OrderFinancialStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'VOIDED'
  | 'EXPIRED';

/** Shopify `OrderFulfillmentStatus` (includes deprecated values the API may still return). */
export type OrderFulfillmentStatus =
  | 'UNFULFILLED'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'SCHEDULED'
  | 'OPEN'
  | 'PENDING_FULFILLMENT'
  | 'RESTOCKED';

/** Shopify `OrderCancelReason`. */
export type OrderCancelReason = 'CUSTOMER' | 'DECLINED' | 'FRAUD' | 'INVENTORY' | 'OTHER' | 'STAFF';

/** Shopify `FulfillmentStatus` (state of one fulfillment record). */
export type FulfillmentStatus = 'SUCCESS' | 'CANCELLED' | 'ERROR' | 'FAILURE' | 'OPEN' | 'PENDING';

/** Shopify `FulfillmentEventStatus` (carrier/shipment progress). */
export type FulfillmentEventStatus =
  | 'LABEL_PURCHASED'
  | 'LABEL_PRINTED'
  | 'CONFIRMED'
  | 'READY_FOR_PICKUP'
  | 'CARRIER_PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'ATTEMPTED_DELIVERY'
  | 'DELAYED'
  | 'FAILURE'
  | 'DELIVERED'
  | 'PICKED_UP';

/** Customer-facing status derived in `lib/order-status.ts`; not a Shopify field. */
export type OrderStatus =
  | 'awaiting_payment'
  | 'processing'
  | 'partially_shipped'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivery_issue'
  | 'delivered'
  | 'cancelled';

export type OrderTab = 'all' | 'to_pay' | 'to_ship' | 'to_receive' | 'completed' | 'cancelled';

export interface Image {
  url: string;
  altText: string | null;
}

/** Shopify `LineItem` (subset). */
export interface LineItem {
  id: string;
  title: string;
  variantTitle: string | null;
  quantity: number;
  price: Money | null;
  totalPrice: Money | null;
  totalDiscount: Money;
  image: Image | null;
}

/** Shopify `FulfillmentLineItem`. */
export interface FulfillmentLineItem {
  id: string;
  quantity: number | null;
  lineItem: Pick<LineItem, 'id'>;
}

/** Shopify `TrackingInformation`. Every field may be null. */
export interface TrackingInformation {
  company: string | null;
  number: string | null;
  url: string | null;
}

/** Shopify `FulfillmentEvent`: status and time only, no message or location. */
export interface FulfillmentEvent {
  id: string;
  happenedAt: string;
  status: FulfillmentEventStatus;
}

/** Shopify `Fulfillment` (one shipment). */
export interface Fulfillment {
  id: string;
  createdAt: string;
  status: FulfillmentStatus | null;
  latestShipmentStatus: FulfillmentEventStatus | null;
  estimatedDeliveryAt: string | null;
  trackingInformation: TrackingInformation[];
  fulfillmentLineItems: FulfillmentLineItem[];
  events: FulfillmentEvent[];
}

/** Shopify `CustomerAddress` (subset). */
export interface CustomerAddress {
  name: string | null;
  phoneNumber: string | null;
  /** Shopify pre-formats the address into display lines for the store's locale. */
  formatted: string[];
}

/** Shopify `Order` (subset). */
export interface Order {
  id: string;
  /** Customer-facing order number, e.g. "#1001". */
  name: string;
  processedAt: string;
  financialStatus: OrderFinancialStatus | null;
  fulfillmentStatus: OrderFulfillmentStatus;
  cancelledAt: string | null;
  cancelReason: OrderCancelReason | null;
  lineItems: LineItem[];
  subtotal: Money | null;
  totalShipping: Money;
  totalPrice: Money;
  shippingAddress: CustomerAddress | null;
  fulfillments: Fulfillment[];
  /** Shopify-hosted order status page for this order. */
  statusPageUrl: string;
}
