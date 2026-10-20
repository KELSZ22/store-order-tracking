import {storeConfig} from '../../../config/store';
import {formatMoney} from '../../../lib/currency';
import type {LineItem} from '../types';
import {ProductThumbnail} from './ProductThumbnail';

export function LineItemList({items}: {items: LineItem[]}) {
  return (
    <ul class="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.id} class="flex items-center gap-3 py-3 first:pt-0">
          <ProductThumbnail item={item} />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-900">{item.title}</p>
            <p class="text-xs text-slate-500">
              {item.variantTitle && `${item.variantTitle} · `}Qty {item.quantity}
            </p>
          </div>
          {item.totalPrice && (
            <p class="shrink-0 text-sm text-slate-900 tabular-nums">
              {formatMoney(item.totalPrice, storeConfig.locale)}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
