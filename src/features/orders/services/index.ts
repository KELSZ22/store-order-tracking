import {storeConfig} from '../../../config/store';
import {createMockOrders} from '../../../data/mock-orders';
import {MockOrderRepository} from './mock-order-repository';
import type {OrderRepository} from './order-repository';

export type {OrderRepository} from './order-repository';

/**
 * Composition root for order data. Phase 1 always uses the mock repository.
 * Append `?simulate=error` or `?simulate=empty` to the URL to preview those states.
 */
function createOrderRepository(): OrderRepository {
  const simulate = new URLSearchParams(window.location.search).get('simulate');
  return new MockOrderRepository(createMockOrders(storeConfig.currency), {
    simulateError: simulate === 'error',
    simulateEmpty: simulate === 'empty',
  });
}

export const orderRepository: OrderRepository = createOrderRepository();
