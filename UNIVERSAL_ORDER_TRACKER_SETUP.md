# Universal Order Tracker — AI Coding Agent Build Prompt

## Role
Act as a senior frontend engineer and UX architect. Build a local-first, customer-facing **reusable customer order tracker** prototype inspired by the useful order-management patterns of Shopee and Lazada, but with an original, brand-neutral interface adaptable to different merchants. Write maintainable, production-quality Preact + TypeScript code.

## Critical Scope — Phase 1 Only
- **Build the app locally in its own repository / codebase**, separate from the existing Shopify Liquid theme.
- **Do not use Shopify CLI**, create a Shopify app, install extensions, or connect to Shopify yet.
- **Do not deploy** to Vercel, Netlify, Shopify, or any hosting provider.
- **Do not require API keys, external databases, authentication services, or third-party backends.**
- Use typed **mock orders and events** to make the interface functional immediately.
- The end goal for a later phase is a Shopify **Customer Account UI Extension** using Preact and Shopify Polaris web components, installed as part of a Shopify app, with extension assets hosted by Shopify. **Important: a generic Vite/Tailwind UI is only a prototype; arbitrary HTML, Tailwind CSS, and DOM behavior cannot be transferred unchanged into Shopify customer account extensions.** Keep domain logic framework-agnostic and UI isolated so it can be rewritten against supported components later.
- Do not modify the live Shopify theme.

## Technology
- Preact + TypeScript
- Vite (Preact + TS template)
- Tailwind CSS v4 (`tailwindcss` + `@tailwindcss/vite`) for **local prototype styling only**
- `lucide-preact` icons
- Native Preact signals/hooks or simple hooks as needed; avoid unnecessary libraries
- No backend in Phase 1

## Bootstrap
Execute (if the project does not already exist):

```bash
npm create vite@latest universal-order-tracker -- --template preact-ts
cd universal-order-tracker
npm install
npm install tailwindcss @tailwindcss/vite lucide-preact
```

Update `vite.config.ts`:

```ts
import {defineConfig} from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [preact(), tailwindcss()],
});
```

In the app's main CSS file, add `@import "tailwindcss";`. Preserve any necessary existing CSS; remove unused starter styles and demo assets. Run with `npm run dev`.

## Suggested Architecture

```text
universal-order-tracker/
├── src/
│   ├── app/
│   │   └── App.tsx
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── orders/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   └── tracking/
│   │       └── components/
│   ├── config/
│   │   └── store.ts
│   ├── data/
│   │   └── mock-orders.ts
│   ├── lib/
│   │   ├── order-status.ts
│   │   └── currency.ts
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Adapt filenames as needed to fit Vite defaults. Keep business logic independent of presentation.

## User Experience and Visual Direction
- **Customer-facing**, not a merchant/admin dashboard.
- Responsive desktop and mobile interfaces, mobile-first.
- Brand-neutral visual foundation with configurable design tokens (brand name, logo, primary/secondary colors, font family, corner radius). Provide a polished default theme without coffee-specific visuals, logos, or copy; do not copy Shopee/Lazada styling.
- Accessible controls with visible focus states, semantic labels, touch-friendly sizes, good contrast, and loading/empty/error states.
- Support configurable locale and currency (e.g., `en-PH` + `PHP` by default), with `Intl.NumberFormat` rather than hardcoded peso symbols. Mock delivery addresses may use synthetic Philippine examples, but make the locale configurable.
- Show a clear "Demo data" label where appropriate to avoid implying real Shopify connectivity.

## Store Configuration and Reusability
- Define one typed `StoreConfig` for `storeName`, `logoUrl` (optional), `storefrontUrl`, `locale`, `currency`, and theme tokens.
- Create a `src/config/store.ts` with safe demo defaults; UI must use this config instead of hardcoded brand names, colors, URLs, or currency.
- Keep all store/order data isolated behind an `OrderRepository` interface so the same codebase can be configured for another Shopify store later.
- Do not assume access across different merchants or combine one store's customers with another's. Each eventual Shopify installation will need its own authorized store context and customer identity.
- This phase is a **single-store demo with reusable configuration**, not a connected multi-tenant production service.

## Required Functional Screens

### 1. My Orders dashboard
- Heading, brief summary, and search by order number or product name.
- Filter tabs: **All**, **To Pay** (if applicable), **To Ship**, **To Receive**, **Completed**, **Cancelled**.
- Order cards with order number, date, item thumbnails or graceful placeholders, titles, quantities, total price, and status.
- Clicking a card navigates to Order Details without a full page reload. A small custom view-state router is acceptable for the prototype.
- Show count of orders per status and useful empty states.

### 2. Order Details
- Order summary, product line items, subtotal, shipping cost, discounts, total.
- Payment state distinct from fulfillment/delivery state.
- Customer delivery details (synthetic), courier name, tracking number, and tracking URL if present.
- Clear return-to-orders action.
- "Buy Again" should be a clearly labeled **demo action** or use a storefront product URL derived from store configuration and mock product data; do not invent a working Shopify checkout.

### 3. Order Activity Timeline
- Steps: **Order placed → Confirmed/Processing → Packed → Shipped → Out for delivery → Delivered**, where applicable.
- Represent only events actually present in the mock dataset; don't assert timestamps for missing milestones.
- Show cancellation or failed-delivery states where provided.
- Use event timestamps and descriptions. Keep payment, fulfillment and carrier events conceptually separate.

### 4. Tracking panel
- Carrier name, tracking number, optional clickable tracking URL.
- Copy-tracking-number action, using a safe browser clipboard approach with usable fallback.
- If no tracking number exists, display "Tracking details not available yet."
- Don't fabricate live GPS, courier scans, or real-time shipment status.

## Mock Data and Types
Define strongly typed types for `Order`, `OrderLineItem`, `OrderStatus`, `PaymentStatus`, `FulfillmentStatus`, `TrackingEvent`, and `Shipment`. Provide at least 8 diverse sample orders across all major states, including:
- Awaiting payment
- Processing / unfulfilled
- Shipped / in transit
- Out for delivery
- Delivered
- Cancelled
- Partial fulfillment / multiple shipments
- Order with no tracking details

Ensure counts and filters reflect mock data accurately. Use timestamps with explicit timezone assumptions. Avoid leaking mock personal data that resembles a real person's contact details.

## Data Service Boundary
Implement asynchronous functions such as:

```ts
export interface OrderRepository {
  listOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
}
```

Use a mock repository in Phase 1. UI components must not import mock data directly. This will simplify replacing the repository with a Shopify Customer Account API adapter on each authorized store in a later phase. Never put Shopify Admin API secrets in browser code.

## Implementation Order
1. Scaffold project and configure dependencies.
2. Create types, helpers, and mock repository.
3. Implement responsive layout and design tokens.
4. Build Orders dashboard with functional search and tabs.
5. Build order details and tracking timeline.
6. Implement navigation and interaction states.
7. Add accessibility polish and mobile refinements.
8. Run checks and fix errors.

## Acceptance Criteria
- `npm install`, `npm run dev`, and `npm run build` work without errors.
- App opens locally (usually `http://localhost:5173`).
- Orders are rendered from the mock repository, not hardcoded inline in components.
- Search, tabs, opening order details, back navigation, and tracking-number copy work.
- Layout is usable at 360px mobile width and desktop widths.
- Clear empty states for filters and missing shipment data.
- No Shopify CLI, Shopify app registration, API credentials, external backend, or deployment is performed.
- README documents setup, scripts, architecture, how to customize store branding/currency/URL, prototype limitations, and later Shopify integration considerations.

## Future Integration Note — Do Not Implement Yet
In Phase 2, we intend to create an **extension-only Shopify app** with a customer account UI extension (and potentially an App Home extension), using Shopify-supported Preact + Polaris web components. Plan the installation and distribution approach separately if the app will be deployed to multiple independent merchants; a local reusable codebase alone does not make the Shopify app universally installable. Customer order history will come from authenticated Customer Account API access with appropriate permissions. The local UI may need substantial adaptation to extension constraints. **Keep Phase 1 completely local and independent.**

## Agent Output
Implement the actual project files rather than only describing them. Include a short example showing how a developer can change `src/config/store.ts` to brand the app for a different shop. At completion, summarize created files, available screens, commands run, test/build results, and any known limitations. Do not request unnecessary confirmation; choose sensible defaults and proceed.
