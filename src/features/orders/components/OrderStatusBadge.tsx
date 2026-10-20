import {Badge} from '../../../components/ui/Badge';
import {ORDER_STATUS_META, getOrderStatus} from '../../../lib/order-status';
import type {Order} from '../types';

export function OrderStatusBadge({order}: {order: Order}) {
  const meta = ORDER_STATUS_META[getOrderStatus(order)];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
