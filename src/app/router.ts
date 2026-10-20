import {useEffect, useState} from 'preact/hooks';

/**
 * Minimal hash-based view router. Hash navigation avoids full page reloads,
 * keeps browser back/forward working and needs no server rewrites.
 */
export type Route = {name: 'orders'} | {name: 'order'; id: string} | {name: 'not_found'};

export const routes = {
  orders: () => '#/orders',
  order: (id: string) => `#/orders/${encodeURIComponent(id)}`,
};

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/orders';
  if (path === '/' || path === '/orders') return {name: 'orders'};
  const match = path.match(/^\/orders\/([^/]+)$/);
  if (match) return {name: 'order', id: decodeURIComponent(match[1])};
  return {name: 'not_found'};
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
