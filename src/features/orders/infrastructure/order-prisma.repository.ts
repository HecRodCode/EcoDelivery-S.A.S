import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { OrderFilters, OrderRepository } from '../domain/order.repository';
import { Order } from '../domain/order.entity';
import { OrderPrismaMapper } from './order-prisma.mapper';

@Injectable()
export class OrderPrismaRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: Order): Promise<void> {
    const data = OrderPrismaMapper.toPersistence(order);

    await this.prisma.order.upsert({
      where: { idPedido: data.idPedido },
      create: data,
      update: data,
    });
  }

  async findById(idPedido: string): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { idPedido },
    });

    return record ? OrderPrismaMapper.toDomain(record) : null;
  }

  async findAll(filters: OrderFilters): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: {
        estado: filters.estado,
        zona: filters.zona,
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return records.map(OrderPrismaMapper.toDomain);
  }
}
