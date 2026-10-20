import {
  ArrowLeft,
  Ban,
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  ExternalLink,
  History,
  MapPin,
  PackageX,
  RefreshCw,
  TriangleAlert,
  Truck,
} from 'lucide-preact';
import {routes} from '../../../app/router';
import {Badge} from '../../../components/ui/Badge';
import {Button, buttonClass} from '../../../components/ui/Button';
import {Card} from '../../../components/ui/Card';
import {Disclosure} from '../../../components/ui/Disclosure';
import {EmptyState} from '../../../components/ui/EmptyState';
import {Skeleton} from '../../../components/ui/Skeleton';
import {storeConfig} from '../../../config/store';
import {formatMoney} from '../../../lib/currency';
import {formatDate, formatDateTime, formatShortDate} from '../../../lib/date';
import {
  CANCEL_REASON_LABEL,
  FINANCIAL_STATUS_META,
  ORDER_STATUS_META,
  buildProgress,
  buildUpdates,
  estimatedDelivery,
  getOrderStatus,
  type Tone,
} from '../../../lib/order-status';
import {ProgressSteps} from '../../tracking/components/ProgressSteps';
import {TrackingPanel} from '../../tracking/components/TrackingPanel';
import {UpdatesList} from '../../tracking/components/UpdatesList';
import {LineItemList} from '../components/LineItemList';
import {PriceSummary} from '../components/PriceSummary';
import {useOrder} from '../hooks/useOrders';
import type {Order, OrderStatus} from '../types';

const STATUS_ICON: Record<OrderStatus, typeof Truck> = {
  awaiting_payment: Clock,
  processing: Clock,
  partially_shipped: Truck,
  shipped: Truck,
  out_for_delivery: Truck,
  delivery_issue: TriangleAlert,
  delivered: CircleCheck,
  cancelled: Ban,
};

const ICON_TONE: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-brand-soft text-brand',
  warning: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-rose-100 text-rose-800',
};

/** The one card that answers "where is my order?": status, progress and tracking. */
function StatusCard({order}: {order: Order}) {
  const status = getOrderStatus(order);
  const meta = ORDER_STATUS_META[status];
  const Icon = STATUS_ICON[status];
  const progress = buildProgress(order);
  const eta = estimatedDelivery(order);

  return (
    <Card>
      <div class="flex gap-3">
        <span class={`grid size-10 shrink-0 place-items-center rounded-full ${ICON_TONE[meta.tone]}`}>
          <Icon class="size-5" aria-hidden />
        </span>
        <div class="min-w-0">
          <p class="text-lg font-semibold text-slate-900">{meta.label}</p>
          <p class="text-sm text-slate-600">
            {order.cancelReason ? CANCEL_REASON_LABEL[order.cancelReason] : meta.description}
          </p>
          {eta && (
            <p class="mt-1 text-sm text-slate-900">
              Estimated delivery:{' '}
              <time dateTime={eta} class="font-semibold">
                {formatShortDate(eta, storeConfig)}
              </time>
            </p>
          )}
        </div>
      </div>

      {progress && (
        <div class="mt-5">
          <ProgressSteps steps={progress} />
        </div>
      )}

      {status !== 'cancelled' && (
        <div class="mt-5 border-t border-slate-100 pt-4">
          <TrackingPanel order={order} />
        </div>
      )}
    </Card>
  );
}

function OrderDetails({order}: {order: Order}) {
  const payment = order.financialStatus ? FINANCIAL_STATUS_META[order.financialStatus] : null;
  const address = order.shippingAddress;
  const updates = buildUpdates(order);

  return (
    <div class="space-y-4">
      <StatusCard order={order} />

      <Card title="Items">
        <LineItemList items={order.lineItems} />
        <details class="group mt-3 border-t border-slate-200 pt-3">
          <summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <span class="text-base font-semibold text-slate-900">Total</span>
            <span class="flex items-center gap-2">
              <span class="text-xs text-brand underline-offset-2 group-hover:underline">
                <span class="group-open:hidden">Show details</span>
                <span class="hidden group-open:inline">Hide details</span>
              </span>
              <span class="text-base font-semibold text-slate-900 tabular-nums">
                {formatMoney(order.totalPrice, storeConfig.locale)}
              </span>
            </span>
          </summary>
          <div class="pt-2">
            <PriceSummary order={order} />
          </div>
        </details>
      </Card>

      <Card>
        {address && (
          <Disclosure icon={MapPin} title="Delivery address" summary={address.name ?? address.formatted[0]}>
            <address class="text-sm text-slate-700 not-italic">
              {address.name && <span class="block font-medium text-slate-900">{address.name}</span>}
              {address.phoneNumber && <span class="block">{address.phoneNumber}</span>}
              {address.formatted.map((line) => (
                <span key={line} class="block">
                  {line}
                </span>
              ))}
            </address>
          </Disclosure>
        )}
        {payment && (
          <Disclosure icon={CreditCard} title="Payment" summary={payment.label}>
            <Badge tone={payment.tone}>{payment.label}</Badge>
            <p class="mt-2 text-sm text-slate-600">
              Total charged or due: {formatMoney(order.totalPrice, storeConfig.locale)}
            </p>
          </Disclosure>
        )}
        <Disclosure icon={History} title="All updates" summary={`${updates.length}`}>
          <UpdatesList updates={updates} />
        </Disclosure>
      </Card>

      <a
        href={order.statusPageUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        Open order status page
        <span class="text-slate-500">(demo link)</span>
        <ExternalLink class="size-4" aria-hidden />
        <span class="sr-only">, opens in a new tab</span>
      </a>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div class="space-y-4" aria-hidden>
      <Skeleton class="h-56 w-full rounded-store" />
      <Skeleton class="h-40 w-full rounded-store" />
      <Skeleton class="h-36 w-full rounded-store" />
    </div>
  );
}

export function OrderDetailsPage({id}: {id: string}) {
  const {state, reload} = useOrder(id);
  const order = state.status === 'success' ? state.data : null;

  return (
    <div class="mx-auto max-w-2xl space-y-4">
      <a
        href={routes.orders()}
        class="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-store px-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft class="size-4" aria-hidden />
        Back to orders
      </a>

      <div>
        <h1
          id="page-heading"
          tabIndex={-1}
          class="text-2xl font-bold tracking-tight text-slate-900 focus:outline-none"
        >
          {order ? `Order ${order.name}` : 'Order details'}
        </h1>
        {order && (
          <p class="mt-1 text-sm text-slate-600">
            Placed{' '}
            <time dateTime={order.processedAt} title={formatDateTime(order.processedAt, storeConfig)}>
              {formatDate(order.processedAt, storeConfig)}
            </time>
          </p>
        )}
      </div>

      {state.status === 'loading' && (
        <>
          <span class="sr-only" role="status">
            Loading order…
          </span>
          <DetailsSkeleton />
        </>
      )}

      {state.status === 'error' && (
        <EmptyState
          role="alert"
          icon={CircleAlert}
          title="We couldn’t load this order"
          description="Please check your connection and try again."
          action={
            <Button variant="primary" onClick={reload}>
              <RefreshCw class="size-4" aria-hidden /> Try again
            </Button>
          }
        />
      )}

      {state.status === 'success' && !order && (
        <EmptyState
          icon={PackageX}
          title="Order not found"
          description="This order doesn’t exist or isn’t available on this account."
          action={
            <a href={routes.orders()} class={buttonClass('primary')}>
              View all orders
            </a>
          }
        />
      )}

      {order && <OrderDetails order={order} />}
    </div>
  );
}
