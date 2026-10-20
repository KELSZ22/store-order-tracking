import type {Order} from '../types';

/**
 * Data boundary for orders. UI code depends only on this interface, so the
 * Phase 1 mock can later be swapped for a Shopify Customer Account API adapter
 * scoped to a single authorized store and customer.
 */
export interface OrderRepository {
  listOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
}
