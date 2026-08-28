import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../shared/domain/domain.error';
import { Order } from '../domain/order.entity';
import { ORDER_REPOSITORY } from '../domain/order.repository';
import type { OrderRepository } from '../domain/order.repository';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(idPedido: string): Promise<Order> {
    const order = await this.orderRepository.findById(idPedido);

    if (!order) {
      throw new EntityNotFoundError('Pedido', idPedido);
    }

    return order;
  }
}
