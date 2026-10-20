import type {Order} from '../types';
import type {OrderRepository} from './order-repository';

export interface MockOrderRepositoryOptions {
  /** Simulated network latency so loading states are visible. */
  latencyMs?: number;
  /** Force every call to reject, to exercise error states. */
  simulateError?: boolean;
  /** Return no orders, to exercise empty states. */
  simulateEmpty?: boolean;
}

export class MockOrderRepository implements OrderRepository {
  private readonly orders: Order[];
  private readonly options: Required<MockOrderRepositoryOptions>;

  constructor(orders: Order[], options: MockOrderRepositoryOptions = {}) {
    this.orders = orders;
    this.options = {latencyMs: 350, simulateError: false, simulateEmpty: false, ...options};
  }

  async listOrders(): Promise<Order[]> {
    await this.respond();
    if (this.options.simulateEmpty) return [];
    return structuredClone(this.orders).sort((a, b) => b.processedAt.localeCompare(a.processedAt));
  }

  async getOrderById(id: string): Promise<Order | null> {
    await this.respond();
    if (this.options.simulateEmpty) return null;
    const order = this.orders.find((o) => o.id === id);
    return order ? structuredClone(order) : null;
  }

  private respond(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.options.simulateError) {
          reject(new Error('Simulated network error (demo).'));
        } else {
          resolve();
        }
      }, this.options.latencyMs);
    });
  }
}
