import { Module } from '@nestjs/common';
import { CreateOrderUseCase } from './application/create-order.use-case';
import { GetOrderUseCase } from './application/get-order.use-case';
import { ListOrdersUseCase } from './application/list-orders.use-case';
import { UpdateOrderStatusUseCase } from './application/update-order-status.use-case';
import { ORDER_REPOSITORY } from './domain/order.repository';
import { OrderPrismaRepository } from './infrastructure/order-prisma.repository';
import { OrdersController } from './presentation/orders.controller';

@Module({
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    { provide: ORDER_REPOSITORY, useClass: OrderPrismaRepository },
  ],
})
export class OrdersModule {}
