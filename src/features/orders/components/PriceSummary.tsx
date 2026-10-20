import {storeConfig} from '../../../config/store';
import {formatMoney} from '../../../lib/currency';
import {priceBreakdown, totalQuantity} from '../../../lib/order-status';
import type {Order} from '../types';

/** Price breakdown built only from Shopify line item and order totals. */
export function PriceSummary({order}: {order: Order}) {
  const {locale} = storeConfig;
  const quantity = totalQuantity(order);
  const {items, discount} = priceBreakdown(order);

  return (
    <dl class="space-y-2 text-sm">
      <div class="flex justify-between gap-4">
        <dt class="text-slate-600">
          Items ({quantity})
        </dt>
        <dd class="text-slate-900 tabular-nums">{formatMoney(items, locale)}</dd>
      </div>
      {discount.amount > 0 && (
        <div class="flex justify-between gap-4">
          <dt class="text-slate-600">Discount</dt>
          <dd class="text-emerald-700 tabular-nums">−{formatMoney(discount, locale)}</dd>
        </div>
      )}
      <div class="flex justify-between gap-4">
        <dt class="text-slate-600">Shipping</dt>
        <dd class="text-slate-900 tabular-nums">
          {order.totalShipping.amount === 0 ? 'Free' : formatMoney(order.totalShipping, locale)}
        </dd>
      </div>
    </dl>
  );
}
