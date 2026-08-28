import { OrderStatus } from './order-status.enum';
import { Order } from './order.entity';
import { Zone } from './zone.enum';

export interface OrderFilters {
  estado?: OrderStatus;
  zona?: Zone;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(idPedido: string): Promise<Order | null>;
  findAll(filters: OrderFilters): Promise<Order[]>;
}
