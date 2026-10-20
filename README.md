# Universal Order Tracker (Phase 1 prototype)

An order tracker for customers that runs entirely on your machine. It is built with **Preact + TypeScript + Vite**, and its design can be re-branded for any store. Customers can browse their orders, filter and search them, open an order's details, follow a delivery timeline and copy a tracking number.

> **Demo data only.** This prototype is not connected to Shopify or any carrier. All orders, people, addresses and tracking numbers are made up.

## Setup

Requires Node 20+.

```bash
npm install
npm run dev       # http://localhost:5173
```

| Script            | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR        |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally         |

### Previewing loading, error and empty states

- Every repository call has a simulated delay of about 350 ms, so loading skeletons appear on every load.
- Add `?simulate=error` to the URL to see the error state with a retry button. For example: `http://localhost:5173/?simulate=error#/orders`.
- Add `?simulate=empty` to the URL to see the "no orders yet" state.

## Screens

| Route                | Screen                                                                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#/orders`           | **My Orders**: search by order number or product, status tabs with counts (All, To Pay, To Ship, To Receive, Completed, Cancelled), order cards, empty states.                                                                                 |
| `#/orders/:id`       | **Order details**: one status card that answers "where is my order?" (status, estimated delivery, 4-step progress, carrier, tracking number with copy, "Track package"), then items with the total. The price breakdown, delivery address, payment and full update history are collapsed rows, so the screen stays short. |

Navigation uses the URL hash, so pages change without a full reload and the browser back button works. Your filters, search text and scroll position are kept when you return to the list.

## Architecture

```text
src/
├── app/                 App root + hash router
├── components/
│   ├── layout/          AppShell (header, "Demo data" badge, footer)
│   └── ui/              Badge, Button, Card, EmptyState, Skeleton
├── config/store.ts      StoreConfig: branding, locale, currency, URLs, theme tokens
├── data/mock-orders.ts  Synthetic orders (only the repository reads this)
├── features/
│   ├── orders/
│   │   ├── types.ts     Mirrors Shopify Customer Account API: Order, LineItem, Fulfillment, FulfillmentEvent, TrackingInformation…
│   │   ├── services/    OrderRepository interface + MockOrderRepository
│   │   ├── hooks/       useOrders / useOrder (async state: loading, error, success)
│   │   ├── components/  OrderCard, StatusTabs, OrderSearch, LineItemList, PriceSummary…
│   │   └── pages/       OrdersPage, OrderDetailsPage
│   └── tracking/components/  ProgressSteps, TrackingPanel, UpdatesList, CopyButton
├── lib/                 Pure logic, no framework code
│   ├── order-status.ts  Works out each order's status and tab, plus search, counts and milestones
│   ├── currency.ts      Intl.NumberFormat money formatting
│   ├── date.ts          Intl.DateTimeFormat in the configured time zone
│   └── clipboard.ts     Clipboard API with execCommand fallback
└── styles/index.css     Tailwind v4 + theme tokens (CSS custom properties)
```

Key design decisions:

- **Data boundary.** UI components get their data only through `OrderRepository`, using the `useOrders` and `useOrder` hooks. They never import mock data.
- **Shopify fields only.** `features/orders/types.ts` uses only fields the Shopify Customer Account API exposes, with Shopify's enum values verbatim (`financialStatus`, `fulfillmentStatus`, `cancelReason`, `latestShipmentStatus`, `FulfillmentEventStatus`, …). Mock data follows the same shape, so a real API adapter only needs to unwrap GraphQL connections and parse money strings.
- **Derived status.** The status a customer sees (for example "Out for delivery") is worked out in `lib/order-status.ts` from `financialStatus`, `fulfillmentStatus` and each fulfillment's `latestShipmentStatus`. All customer-facing wording lives there too.
- **Progress is honest.** The 4 steps (Ordered → Shipped → Out for delivery → Delivered) get dates only from `processedAt`, fulfillment `createdAt` and fulfillment events. Shopify events have no message or location, so none are shown. A partly shipped order is never shown as "Delivered".
- **No invented tracking.** The app never shows GPS positions or live carrier scans. If a shipment has no tracking number, it shows "Tracking details not available yet."

## Customizing for another store

All branding comes from `src/config/store.ts`. For example, to re-brand the app for a US store:

```ts
export const storeConfig: StoreConfig = {
  storeName: 'Northwind Outfitters',
  logoUrl: '/northwind-logo.svg',          // put the file in /public, or omit it to show the store name as text
  storefrontUrl: 'https://northwind.example',
  locale: 'en-US',
  currency: 'USD',
  timeZone: 'America/New_York',
  showToPayTab: false,                      // hide this tab if the store only takes prepaid orders
  theme: {
    primary: '#7c3aed',
    onPrimary: '#ffffff',
    secondary: '#ede9fe',
    fontFamily: '"Inter", system-ui, sans-serif',
    radius: '0.5rem',
  },
};
```

How the settings are applied:

- **Theme.** At startup, `applyStoreTheme()` turns the theme values into CSS custom properties. Tailwind exposes them as the classes `bg-brand`, `text-on-brand`, `bg-brand-soft`, `rounded-store` and `font-sans`.
- **Money, dates and links.** Prices are formatted with `Intl.NumberFormat(locale, {currency})`. Dates use `timeZone`. "Continue shopping" points to `storefrontUrl`.
- **Mock data currency.** The mock orders use whatever `currency` is set in the config. The amounts themselves are written in PHP-like sizes, so they may look odd in other currencies.

## Prototype limitations

- **Mock data only.** There is no backend, no login and no Shopify connection. Tracking and order status page links point to `example.com`.
- **What Shopify can't tell us.** Many carriers send no fulfillment events. Those orders stay "Shipped" and never move to Completed, because Shopify has no delivery confirmation for them. The API also can't tell cash-on-delivery apart from an unpaid order. An order with `financialStatus: PENDING` that hasn't started fulfillment shows under "To Pay"; hide that tab with `showToPayTab: false` if this confuses COD customers.
- **No "Buy again".** Line items expose `productId` but no product URL, so this was removed until the app can look up product URLs.
- **Single store.** This is a demo for one store. It is not a multi-tenant service.
- **Not portable as-is.** Tailwind classes, raw HTML and DOM behavior (clipboard, scroll, focus handling) are prototype-only. Shopify customer account extensions cannot use them unchanged.
- **No automated tests yet.** The pure logic in `src/lib/` is the most useful place to start adding them.

## Notes for Phase 2 (Shopify): not implemented

- **What carries over.** The plan is an extension-only Shopify app with a **Customer Account UI Extension**, built with Preact and Polaris web components. The UI layer will need to be rewritten with those supported components. `features/orders/types.ts`, `lib/order-status.ts`, `lib/currency.ts` and `lib/date.ts` can move over largely unchanged.
- **Data source.** Swap `MockOrderRepository` for an adapter that uses the **Customer Account API**. It must be limited to the authenticated customer of a single authorized store. **Never** put Admin API secrets in browser or extension code.
- **Multiple merchants.** Each merchant installation needs its own authorized store context. If the app will go to many independent merchants, plan its distribution (public app vs. custom app) separately.
