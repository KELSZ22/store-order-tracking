import {PackageX} from 'lucide-preact';
import {useEffect, useLayoutEffect, useRef, useState} from 'preact/hooks';
import {AppShell} from '../components/layout/AppShell';
import {buttonClass} from '../components/ui/Button';
import {EmptyState} from '../components/ui/EmptyState';
import {useOrders} from '../features/orders/hooks/useOrders';
import {OrderDetailsPage} from '../features/orders/pages/OrderDetailsPage';
import {OrdersPage} from '../features/orders/pages/OrdersPage';
import type {OrderTab} from '../features/orders/types';
import {routes, useRoute} from './router';

export function App() {
  const route = useRoute();
  // List data and filters live here so they survive navigating to a detail page and back.
  const {state: ordersState, reload} = useOrders();
  const [tab, setTab] = useState<OrderTab>('all');
  const [query, setQuery] = useState('');

  const listScroll = useRef(0);
  const isFirstRender = useRef(true);
  const routeKey = route.name === 'order' ? `order:${route.id}` : route.name;

  // Track list scroll position while it is visible so it can be restored on return.
  useEffect(() => {
    if (route.name !== 'orders') return;
    const onScroll = () => {
      listScroll.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [routeKey]);

  // On view change: restore/reset scroll and move focus to the new page heading.
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo(0, route.name === 'orders' ? listScroll.current : 0);
    document.getElementById('page-heading')?.focus({preventScroll: true});
  }, [routeKey]);

  return (
    <AppShell>
      {route.name === 'orders' && (
        <OrdersPage
          state={ordersState}
          onRetry={reload}
          tab={tab}
          onTabChange={setTab}
          query={query}
          onQueryChange={setQuery}
        />
      )}
      {route.name === 'order' && <OrderDetailsPage key={route.id} id={route.id} />}
      {route.name === 'not_found' && (
        <EmptyState
          icon={PackageX}
          title="Page not found"
          description="The page you’re looking for doesn’t exist."
          action={
            <a href={routes.orders()} class={buttonClass('primary')}>
              Go to my orders
            </a>
          }
        />
      )}
    </AppShell>
  );
}
