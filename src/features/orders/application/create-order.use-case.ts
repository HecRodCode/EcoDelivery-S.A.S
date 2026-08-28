import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Order } from '../domain/order.entity';
import { ORDER_REPOSITORY } from '../domain/order.repository';
import type { OrderRepository } from '../domain/order.repository';
import { PaymentMethod } from '../domain/payment-method.enum';
import { Zone } from '../domain/zone.enum';

export interface CreateOrderInput {
  cliente: string;
  zona: Zone;
  metodoPago: PaymentMethod;
  monto: number;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const order = Order.create({
      idPedido: randomUUID(),
      cliente: input.cliente,
      zona: input.zona,
      metodoPago: input.metodoPago,
      monto: input.monto,
    });

    await this.orderRepository.save(order);

    return order;
  }
}
