import {ExternalLink, Info, Truck} from 'lucide-preact';
import {buttonClass} from '../../../components/ui/Button';
import {SHIPMENT_EVENT_META, activeFulfillments, unshippedItems} from '../../../lib/order-status';
import type {Fulfillment, Order} from '../../orders/types';
import {CopyButton} from './CopyButton';

const NO_TRACKING_MESSAGE = 'Tracking details not available yet.';

interface ShipmentRowProps {
  shipment: Fulfillment;
  /** 1-based number; only set when the order has several shipments. */
  number?: number;
  order: Order;
  primaryAction: boolean;
}

function ShipmentRow({shipment, number, order, primaryAction}: ShipmentRowProps) {
  const info = shipment.trackingInformation[0];
  const statusLabel = shipment.latestShipmentStatus
    ? SHIPMENT_EVENT_META[shipment.latestShipmentStatus].label
    : 'Shipped';
  const contents = number
    ? shipment.fulfillmentLineItems
        .map((fli) => {
          const item = order.lineItems.find((li) => li.id === fli.lineItem.id);
          return item ? `${item.title} × ${fli.quantity ?? item.quantity}` : null;
        })
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <li class="flex gap-3">
      <Truck class="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden />
      <div class="min-w-0 flex-1 space-y-1.5">
        <p class="text-sm text-slate-900">
          <span class="font-medium">{number ? `Shipment ${number}` : info?.company ?? 'Shipment'}</span>
          {number && info?.company && <span class="text-slate-600"> · {info.company}</span>}
          <span class="text-slate-500"> · {statusLabel}</span>
        </p>
        {contents && <p class="text-xs text-slate-500">{contents}</p>}

        {info?.number ? (
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="font-mono text-sm break-all text-slate-700 select-all">{info.number}</span>
            <CopyButton text={info.number} label="tracking number" />
          </div>
        ) : (
          <p class="text-sm text-slate-600">{NO_TRACKING_MESSAGE}</p>
        )}

        {info?.url && (
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            class={`${buttonClass(primaryAction ? 'primary' : 'secondary', 'sm')} w-full sm:w-auto`}
          >
            Track package
            <ExternalLink class="size-4" aria-hidden />
            <span class="sr-only">(opens carrier site in a new tab)</span>
          </a>
        )}
      </div>
    </li>
  );
}

/** Where the package is: carrier, tracking number and link per shipment. */
export function TrackingPanel({order}: {order: Order}) {
  const shipments = activeFulfillments(order);
  const pending = unshippedItems(order);
  const multi = shipments.length > 1;

  if (shipments.length === 0) {
    return (
      <p class="flex gap-3 text-sm text-slate-600">
        <Info class="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden />
        <span>
          <span class="font-medium text-slate-800">{NO_TRACKING_MESSAGE}</span>{' '}
          You’ll see it here once your order ships.
        </span>
      </p>
    );
  }

  return (
    <ul class="space-y-4">
      {shipments.map((s, i) => (
        <ShipmentRow
          key={s.id}
          shipment={s}
          number={multi ? i + 1 : undefined}
          order={order}
          primaryAction={!multi}
        />
      ))}
      {pending.length > 0 && (
        <li class="flex gap-3">
          <Info class="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden />
          <p class="text-sm text-slate-600">
            <span class="font-medium text-slate-800">Not shipped yet: </span>
            {pending.map((p) => `${p.item.title} × ${p.quantity}`).join(', ')}
          </p>
        </li>
      )}
    </ul>
  );
}
