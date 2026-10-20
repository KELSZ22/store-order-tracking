import {storeConfig} from '../../../config/store';
import {formatDateTime} from '../../../lib/date';
import type {OrderUpdate} from '../../../lib/order-status';

/** Full update history, newest first. Only timestamps Shopify actually recorded. */
export function UpdatesList({updates}: {updates: OrderUpdate[]}) {
  return (
    <ol class="space-y-3">
      {updates.map((u, i) => (
        <li key={u.id} class="flex gap-3">
          <span
            aria-hidden
            class={`mt-1.5 size-2 shrink-0 rounded-full ${
              u.problem ? 'bg-rose-600' : i === 0 ? 'bg-brand' : 'bg-slate-300'
            }`}
          />
          <div class="min-w-0">
            <p class={`text-sm ${u.problem ? 'font-medium text-rose-800' : 'text-slate-900'}`}>
              {u.label}
              {u.shipment && <span class="text-slate-500"> · Shipment {u.shipment}</span>}
            </p>
            <time dateTime={u.at} class="text-xs text-slate-500">
              {formatDateTime(u.at, storeConfig)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
