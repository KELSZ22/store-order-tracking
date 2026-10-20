import {useCallback, useEffect, useState} from 'preact/hooks';
import {orderRepository} from '../services';
import type {Order} from '../types';

export type AsyncState<T> =
  | {status: 'loading'}
  | {status: 'error'; error: Error}
  | {status: 'success'; data: T};

function useAsyncResource<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<AsyncState<T>>({status: 'loading'});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({status: 'loading'});
    load().then(
      (data) => active && setState({status: 'success', data}),
      (error: unknown) =>
        active &&
        setState({status: 'error', error: error instanceof Error ? error : new Error(String(error))}),
    );
    return () => {
      active = false;
    };
    // `load` is recreated each render; `key` and `attempt` capture what matters.
  }, [key, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return {state, reload};
}

export function useOrders() {
  return useAsyncResource<Order[]>(() => orderRepository.listOrders(), 'orders');
}

export function useOrder(id: string) {
  return useAsyncResource<Order | null>(() => orderRepository.getOrderById(id), `order:${id}`);
}
