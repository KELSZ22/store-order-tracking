/**
 * Synthetic demo orders shaped exactly like Shopify Customer Account API data.
 * Not connected to any store.
 *
 * - All people, phone numbers, addresses, carriers and tracking numbers are fictional.
 * - Timestamps use the Philippines offset (+08:00) explicitly.
 * - Fulfillment events carry only a status and a time, as in Shopify. Orders
 *   without events reflect stores whose carriers don't report tracking updates.
 *
 * Only the order repository may import this module; UI code goes through
 * `OrderRepository`.
 */
import type {
  CustomerAddress,
  Fulfillment,
  FulfillmentEventStatus,
  Order,
  TrackingInformation,
} from '../features/orders/types';

interface LineItemDraft {
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface FulfillmentDraft {
  createdAt: string;
  status?: Fulfillment['status'];
  estimatedDeliveryAt?: string;
  tracking?: TrackingInformation;
  /** [line item index, quantity] pairs. */
  items: [number, number][];
  events?: [FulfillmentEventStatus, string][];
}

interface OrderDraft
  extends Omit<Order, 'id' | 'lineItems' | 'subtotal' | 'totalShipping' | 'totalPrice' | 'fulfillments' | 'statusPageUrl' | 'cancelledAt' | 'cancelReason' | 'shippingAddress'> {
  lineItems: LineItemDraft[];
  shipping: number;
  fulfillments?: FulfillmentDraft[];
  cancelledAt?: string;
  cancelReason?: Order['cancelReason'];
  shippingAddress?: CustomerAddress;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Computes all money fields from line items so mock figures stay consistent. */
function buildOrder(currencyCode: string, draft: OrderDraft): Order {
  const money = (amount: number) => ({amount: round2(amount), currencyCode});
  const number = draft.name.replace('#', '');
  const id = `demo-${number}`;

  const lineItems = draft.lineItems.map((li, i) => ({
    id: `${id}-li-${i + 1}`,
    title: li.title,
    variantTitle: li.variantTitle ?? null,
    quantity: li.quantity,
    price: money(li.price),
    totalPrice: money(li.price * li.quantity),
    totalDiscount: money(li.discount ?? 0),
    image: null,
  }));

  const gross = lineItems.reduce((sum, li) => sum + (li.totalPrice?.amount ?? 0), 0);
  const discounts = lineItems.reduce((sum, li) => sum + li.totalDiscount.amount, 0);
  const subtotal = gross - discounts;

  const fulfillments: Fulfillment[] = (draft.fulfillments ?? []).map((f, fi) => {
    const events = (f.events ?? []).map(([status, happenedAt], ei) => ({
      id: `${id}-f${fi + 1}-e${ei + 1}`,
      status,
      happenedAt,
    }));
    return {
      id: `${id}-f${fi + 1}`,
      createdAt: f.createdAt,
      status: f.status ?? 'SUCCESS',
      latestShipmentStatus: events.at(-1)?.status ?? null,
      estimatedDeliveryAt: f.estimatedDeliveryAt ?? null,
      trackingInformation: f.tracking ? [f.tracking] : [],
      fulfillmentLineItems: f.items.map(([index, quantity], ii) => ({
        id: `${id}-f${fi + 1}-li-${ii + 1}`,
        quantity,
        lineItem: {id: lineItems[index].id},
      })),
      events,
    };
  });

  const {shipping, cancelledAt, cancelReason, shippingAddress, ...rest} = draft;
  return {
    ...rest,
    id,
    lineItems,
    subtotal: money(subtotal),
    totalShipping: money(shipping),
    totalPrice: money(subtotal + shipping),
    shippingAddress: shippingAddress ?? homeAddress,
    fulfillments,
    cancelledAt: cancelledAt ?? null,
    cancelReason: cancelReason ?? null,
    statusPageUrl: `https://example.com/account/orders/${number}`,
  };
}

const homeAddress: CustomerAddress = {
  name: 'Demo Customer',
  phoneNumber: '+63 900 000 0000',
  formatted: [
    'Unit 1A, Sample Residences',
    '123 Example Street, Brgy. Placeholder',
    '1100 Quezon City, Metro Manila',
    'Philippines',
  ],
};

const officeAddress: CustomerAddress = {
  name: 'Demo Customer',
  phoneNumber: '+63 900 000 0000',
  formatted: ['8F Test Tower, 45 Mock Avenue', '6000 Cebu City, Cebu', 'Philippines'],
};

const tracking = (company: string, number: string, withUrl = true): TrackingInformation => ({
  company,
  number,
  url: withUrl ? `https://example.com/track?number=${number}` : null,
});

export function createMockOrders(currencyCode: string): Order[] {
  const drafts: OrderDraft[] = [
    // Awaiting payment (e.g. bank transfer not yet received)
    {
      name: '#1011',
      processedAt: '2026-10-19T21:14:00+08:00',
      financialStatus: 'PENDING',
      fulfillmentStatus: 'UNFULFILLED',
      lineItems: [{title: 'Wireless Earbuds', variantTitle: 'Graphite', quantity: 1, price: 2499}],
      shipping: 0,
    },

    // Paid, not yet fulfilled
    {
      name: '#1010',
      processedAt: '2026-10-19T10:02:00+08:00',
      financialStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      lineItems: [
        {title: 'Linen Pillow Cover', variantTitle: 'Sand / 45 × 45 cm', quantity: 2, price: 549},
        {title: 'Scented Candle', variantTitle: 'Cedar', quantity: 1, price: 690},
      ],
      shipping: 120,
    },

    // Cash on delivery, being prepared (fulfillment in progress)
    {
      name: '#1009',
      processedAt: '2026-10-18T16:25:00+08:00',
      financialStatus: 'PENDING',
      fulfillmentStatus: 'IN_PROGRESS',
      lineItems: [
        {title: 'Insulated Steel Water Bottle', variantTitle: '750 ml / Sage', quantity: 1, price: 899},
      ],
      shipping: 95,
    },

    // Shipped, in transit, with estimated delivery and a discount
    {
      name: '#1008',
      processedAt: '2026-10-16T08:47:00+08:00',
      financialStatus: 'PAID',
      fulfillmentStatus: 'FULFILLED',
      lineItems: [
        {title: 'Everyday Canvas Tote', variantTitle: 'Natural', quantity: 1, price: 799, discount: 200},
        {title: 'Cotton Crew T-Shirt', variantTitle: 'White / M', quantity: 3, price: 450},
      ],
      shipping: 150,
      shippingAddress: officeAddress,
      fulfillments: [
        {
          createdAt: '2026-10-17T10:00:00+08:00',
          estimatedDeliveryAt: '2026-10-22T18:00:00+08:00',
          tracking: tracking('Demo Express', 'DMX100800001PH'),
          items: [
            [0, 1],
            [1, 3],
          ],
          events: [
            ['LABEL_PRINTED', '2026-10-17T10:05:00+08:00'],
            ['CARRIER_PICKED_UP', '2026-10-17T15:20:00+08:00'],
            ['IN_TRANSIT', '2026-10-18T22:05:00+08:00'],
          ],
        },
      ],
    },

    // Out for delivery
    {
      name: '#1007',
      processedAt: '2026-10-15T19:33:00+08:00',
      financialStatus: 'PAID',
      fulfillmentStatus: 'FULFILLED',
      lineItems: [{title: 'LED Desk Lamp', variantTitle: 'Matte Black', quantity: 1, price: 1650}],
      shipping: 0,
      fulfillments: [
        {
          createdAt: '2026-10-16T14:15:00+08:00',
          estimatedDeliveryAt: '2026-10-20T20:00:00+08:00',
          tracking: tracking('Sample Logistics', 'SL-2026-0007731'),
          items: [[0, 1]],
          events: [
            ['CARRIER_PICKED_UP', '2026-10-16T17:45:00+08:00'],
            ['IN_TRANSIT', '2026-10-18T06:30:00+08:00'],
            ['OUT_FOR_DELIVERY', '2026-10-20T08:10:00+08:00'],
          ],
        },
      ],
    },

    // Partially fulfilled: one shipment delivered, one in transit, one item not shipped
    {
      name: '#1006',
      processedAt: '2026-10-12T12:00:00+08:00',
      financialStatus: 'PAID',
      fulfillmentStatus: 'PARTIALLY_FULFILLED',
      lineItems: [
        {title: 'Dotted Notebook Set', variantTitle: 'A5 / 3-pack', quantity: 1, price: 520},
        {title: 'Gel Pen Set', variantTitle: '12 colors', quantity: 2, price: 280},
        {title: 'Bamboo Desk Organizer', quantity: 1, price: 1190},
      ],
      shipping: 180,
      fulfillments: [
        {
          createdAt: '2026-10-13T16:00:00+08:00',
          tracking: tracking('Demo Express', 'DMX100600001PH'),
          items: [[0, 1]],
          events: [
            ['IN_TRANSIT', '2026-10-14T09:00:00+08:00'],
            ['DELIVERED', '2026-10-15T14:22:00+08:00'],
          ],
        },
        {
          createdAt: '2026-10-17T11:45:00+08:00',
          tracking: tracking('Sample Logistics', 'SL-2026-0006112', false),
          items: [[1, 2]],
          events: [['IN_TRANSIT', '2026-10-18T07:30:00+08:00']],
        },
      ],
    },

    // Fulfilled by the store's own delivery: no tracking info, no carrier events
    {
      name: '#1005',
      processedAt: '2026-10-14T09:15:00+08:00',
      financialStatus: 'PAID',
      fulfillmentStatus: 'FULFILLED',
      lineItems: [{title: 'Bamboo Cutting Board', variantTitle: 'Large', quantity: 1, price: 750}],
      shipping: 60,
      fulfillments: [{createdAt: '2026-10-19T13:00:00+08:00', items: [[0, 1]]}],
    },

    // Cash on delivery, delivery attempt failed
    {
      name: '#1004',
      processedAt: '2026-10-11T20:40:00+08:00',
      financialStatus: 'PENDING',
      fulfillmentStatus: 'FULFILLED',
      lineItems: [{title: 'Running Socks', variantTitle: '3-pack / L', quantity: 2, price: 390}],
      shipping: 95,
      shippingAddress: officeAddress,
      fulfillments: [
        {
          createdAt: '2026-10-13T15:00:00+08:00',
          tracking: tracking('Demo Express', 'DMX100400001PH'),
          items: [[0, 2]],
          events: [
            ['IN_TRANSIT', '2026-10-14T20:00:00+08:00'],
            ['OUT_FOR_DELIVERY', '2026-10-16T08:30:00+08:00'],
            ['ATTEMPTED_DELIVERY', '2026-10-16T15:50:00+08:00'],
          ],
        },
      ],
    },

    // Delivered, with a discount
    {
      name: '#1003',
      processedAt: '2026-10-05T14:05:00+08:00',
      financialStatus: 'PAID',
      fulfillmentStatus: 'FULFILLED',
      lineItems: [
        {title: 'Clear Phone Case', variantTitle: 'Model S', quantity: 1, price: 399, discount: 39.9},
        {title: 'Braided USB-C Cable', variantTitle: '1 m', quantity: 2, price: 299, discount: 59.8},
        {title: 'Tempered Glass Screen Protector', quantity: 1, price: 249, discount: 24.9},
        {title: 'Silicone Cable Organizer', quantity: 1, price: 149, discount: 14.9},
      ],
      shipping: 120,
      fulfillments: [
        {
          createdAt: '2026-10-06T10:30:00+08:00',
          tracking: tracking('Demo Express', 'DMX100300001PH'),
          items: [
            [0, 1],
            [1, 2],
            [2, 1],
            [3, 1],
          ],
          events: [
            ['CARRIER_PICKED_UP', '2026-10-06T16:00:00+08:00'],
            ['IN_TRANSIT', '2026-10-07T05:40:00+08:00'],
            ['OUT_FOR_DELIVERY', '2026-10-08T07:55:00+08:00'],
            ['DELIVERED', '2026-10-08T13:12:00+08:00'],
          ],
        },
      ],
    },

    // Cancelled by the customer and refunded
    {
      name: '#1002',
      processedAt: '2026-10-03T11:20:00+08:00',
      financialStatus: 'REFUNDED',
      fulfillmentStatus: 'UNFULFILLED',
      cancelledAt: '2026-10-03T18:02:00+08:00',
      cancelReason: 'CUSTOMER',
      lineItems: [{title: 'Wool Throw Blanket', variantTitle: 'Charcoal', quantity: 1, price: 2950}],
      shipping: 150,
    },

    // Older delivered order; carrier only reported the final delivery
    {
      name: '#1001',
      processedAt: '2026-09-21T09:00:00+08:00',
      financialStatus: 'PAID',
      fulfillmentStatus: 'FULFILLED',
      lineItems: [{title: 'Ceramic Planter', variantTitle: 'Small / Cream', quantity: 2, price: 480}],
      shipping: 95,
      fulfillments: [
        {
          createdAt: '2026-09-22T14:00:00+08:00',
          tracking: tracking('Sample Logistics', 'SL-2026-0001004', false),
          items: [[0, 2]],
          events: [['DELIVERED', '2026-09-25T11:30:00+08:00']],
        },
      ],
    },
  ];

  return drafts.map((d) => buildOrder(currencyCode, d));
}
