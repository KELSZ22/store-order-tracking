import {CircleAlert, PackageOpen, RefreshCw, SearchX, ShoppingBag} from 'lucide-preact';
import {useMemo} from 'preact/hooks';
import {Button, buttonClass} from '../../../components/ui/Button';
import {EmptyState} from '../../../components/ui/EmptyState';
import {storeConfig} from '../../../config/store';
import {countByTab, filterOrders, getTabs, matchesQuery} from '../../../lib/order-status';
import {OrderCard, OrderCardSkeleton} from '../components/OrderCard';
import {OrderSearch} from '../components/OrderSearch';
import {StatusTabs} from '../components/StatusTabs';
import type {AsyncState} from '../hooks/useOrders';
import type {Order, OrderTab} from '../types';

const EMPTY_TAB_COPY: Record<OrderTab, {title: string; description: string}> = {
  all: {title: 'No orders yet', description: 'When you place an order, it will show up here.'},
  to_pay: {title: 'Nothing to pay', description: 'You have no orders awaiting payment.'},
  to_ship: {title: 'Nothing waiting to ship', description: 'Orders being prepared by the store appear here.'},
  to_receive: {title: 'No orders on the way', description: 'Shipped orders appear here until they are delivered.'},
  completed: {title: 'No completed orders', description: 'Delivered orders appear here.'},
  cancelled: {title: 'No cancelled orders', description: 'Cancelled orders appear here.'},
};

const PANEL_ID = 'orders-panel';

interface OrdersPageProps {
  state: AsyncState<Order[]>;
  onRetry: () => void;
  tab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function OrdersPage({state, onRetry, tab, onTabChange, query, onQueryChange}: OrdersPageProps) {
  const tabs = getTabs(storeConfig);
  const orders = state.status === 'success' ? state.data : null;

  const {visible, tabCounts, allCounts} = useMemo(() => {
    if (!orders) return {visible: [], tabCounts: null, allCounts: null};
    const searched = orders.filter((o) => matchesQuery(o, query));
    return {
      visible: filterOrders(orders, tab, query),
      tabCounts: countByTab(searched),
      allCounts: countByTab(orders),
    };
  }, [orders, tab, query]);

  return (
    <div class="space-y-5">
      <div>
        <h1 id="page-heading" tabIndex={-1} class="text-2xl font-bold tracking-tight text-slate-900 focus:outline-none">
          My Orders
        </h1>
        <p class="mt-1 text-sm text-slate-600">
          {allCounts
            ? `${allCounts.all} ${allCounts.all === 1 ? 'order' : 'orders'} · ${allCounts.to_receive} on the way · ${allCounts.to_ship} being prepared`
            : 'Track deliveries, view receipts and check order status.'}
        </p>
      </div>

      <OrderSearch value={query} onChange={onQueryChange} />

      <StatusTabs
        tabs={tabs}
        active={tab}
        counts={tabCounts}
        onChange={onTabChange}
        panelId={PANEL_ID}
      />

      <div id={PANEL_ID} role="tabpanel" aria-labelledby={`tab-${tab}`} aria-busy={state.status === 'loading'}>
        {state.status === 'loading' && (
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <span class="sr-only" role="status">Loading orders…</span>
            {Array.from({length: 4}, (_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        )}

        {state.status === 'error' && (
          <EmptyState
            role="alert"
            icon={CircleAlert}
            title="We couldn’t load your orders"
            description="Please check your connection and try again."
            action={
              <Button variant="primary" onClick={onRetry}>
                <RefreshCw class="size-4" aria-hidden /> Try again
              </Button>
            }
          />
        )}

        {state.status === 'success' && (
          <>
            <p class="sr-only" role="status" aria-live="polite">
              {visible.length} {visible.length === 1 ? 'order' : 'orders'} shown
            </p>
            {visible.length > 0 ? (
              <ul class="grid grid-cols-1 gap-3 md:grid-cols-2">
                {visible.map((order) => (
                  <li key={order.id}>
                    <OrderCard order={order} />
                  </li>
                ))}
              </ul>
            ) : state.data.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title={EMPTY_TAB_COPY.all.title}
                description={EMPTY_TAB_COPY.all.description}
                action={
                  <a href={storeConfig.storefrontUrl} class={buttonClass('primary')}>
                    Start shopping
                  </a>
                }
              />
            ) : query.trim() ? (
              <EmptyState
                icon={SearchX}
                title={`No orders match “${query.trim()}”`}
                description="Try a different order number or product name."
                action={<Button onClick={() => onQueryChange('')}>Clear search</Button>}
              />
            ) : (
              <EmptyState
                icon={PackageOpen}
                title={EMPTY_TAB_COPY[tab].title}
                description={EMPTY_TAB_COPY[tab].description}
                action={<Button onClick={() => onTabChange('all')}>View all orders</Button>}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
