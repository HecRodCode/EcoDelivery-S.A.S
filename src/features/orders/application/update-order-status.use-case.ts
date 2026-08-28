import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../shared/domain/domain.error';
import { Order } from '../domain/order.entity';
import { OrderStatus } from '../domain/order-status.enum';
import { ORDER_REPOSITORY } from '../domain/order.repository';
import type { OrderRepository } from '../domain/order.repository';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(idPedido: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findById(idPedido);

    if (!order) {
      throw new EntityNotFoundError('Pedido', idPedido);
    }

    order.transitionStatusTo(newStatus);
    await this.orderRepository.save(order);

    return order;
  }
}
