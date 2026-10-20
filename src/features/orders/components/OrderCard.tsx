import {ChevronRight} from 'lucide-preact';
import {routes} from '../../../app/router';
import {Skeleton} from '../../../components/ui/Skeleton';
import {storeConfig} from '../../../config/store';
import {formatMoney} from '../../../lib/currency';
import {formatDate, formatShortDate} from '../../../lib/date';
import {estimatedDelivery, totalQuantity} from '../../../lib/order-status';
import type {Order} from '../types';
import {OrderStatusBadge} from './OrderStatusBadge';
import {ProductThumbnail} from './ProductThumbnail';

const MAX_THUMBS = 4;

export function OrderCard({order}: {order: Order}) {
  const thumbs = order.lineItems.slice(0, MAX_THUMBS);
  const extraThumbs = order.lineItems.length - thumbs.length;
  const [first, ...others] = order.lineItems;
  const quantity = totalQuantity(order);
  const eta = estimatedDelivery(order);

  return (
    <article class="group relative flex h-full flex-col gap-3 rounded-store bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-slate-300 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand">
      <header class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-sm font-semibold text-slate-900">
            {/* Stretched link: the whole card is clickable via ::after. */}
            <a
              href={routes.order(order.id)}
              class="after:absolute after:inset-0 after:rounded-store focus-visible:outline-none"
            >
              Order {order.name}
            </a>
          </h3>
          <p class="text-xs text-slate-500">
            <time dateTime={order.processedAt}>{formatDate(order.processedAt, storeConfig)}</time>
          </p>
        </div>
        <OrderStatusBadge order={order} />
      </header>

      <div class="flex items-center gap-2">
        {thumbs.map((item) => (
          <ProductThumbnail key={item.id} item={item} size="sm" />
        ))}
        {extraThumbs > 0 && (
          <span class="grid size-12 place-items-center rounded-store bg-slate-100 text-xs font-medium text-slate-600">
            +{extraThumbs}
          </span>
        )}
      </div>

      {first && (
        <p class="truncate text-sm text-slate-700">
          {first.title}
          {others.length > 0 && (
            <span class="text-slate-500">
              {' '}
              and {others.length} more
            </span>
          )}
        </p>
      )}

      <footer class="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
        <span class="text-slate-600">
          {eta ? (
            <>
              Arrives by{' '}
              <time dateTime={eta} class="font-medium text-slate-900">
                {formatShortDate(eta, storeConfig)}
              </time>
            </>
          ) : (
            `${quantity} ${quantity === 1 ? 'item' : 'items'}`
          )}
        </span>
        <span class="flex items-center gap-1.5 font-semibold text-slate-900 tabular-nums">
          {formatMoney(order.totalPrice, storeConfig.locale)}
          <ChevronRight
            class="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand"
            aria-hidden
          />
        </span>
      </footer>
    </article>
  );
}

export function OrderCardSkeleton() {
  return (
    <div class="space-y-3 rounded-store bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div class="flex justify-between">
        <div class="space-y-2">
          <Skeleton class="h-4 w-28" />
          <Skeleton class="h-3 w-20" />
        </div>
        <Skeleton class="h-5 w-20 rounded-full" />
      </div>
      <div class="flex gap-2">
        <Skeleton class="size-12 rounded-store" />
        <Skeleton class="size-12 rounded-store" />
      </div>
      <Skeleton class="h-4 w-1/2" />
    </div>
  );
}
