import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../domain/order.entity';
import { ORDER_REPOSITORY } from '../domain/order.repository';
import type { OrderFilters, OrderRepository } from '../domain/order.repository';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(filters: OrderFilters): Promise<Order[]> {
    return this.orderRepository.findAll(filters);
  }
}
