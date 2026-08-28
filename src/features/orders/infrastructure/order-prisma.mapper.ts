import { Order as OrderRecord, Prisma } from '@prisma/client';
import { OrderStatus } from '../domain/order-status.enum';
import { Order } from '../domain/order.entity';
import { PaymentMethod } from '../domain/payment-method.enum';
import { Zone } from '../domain/zone.enum';

export class OrderPrismaMapper {
  static toDomain(record: OrderRecord): Order {
    return Order.reconstitute({
      idPedido: record.idPedido,
      cliente: record.cliente,
      zona: record.zona as Zone,
      fechaCreacion: record.fechaCreacion,
      fechaEntrega: record.fechaEntrega,
      estado: record.estado as OrderStatus,
      repartidor: record.repartidor,
      metodoPago: record.metodoPago as PaymentMethod,
      monto: record.monto.toNumber(),
    });
  }

  static toPersistence(order: Order): Prisma.OrderCreateInput {
    const props = order.toProps();

    return {
      idPedido: props.idPedido,
      cliente: props.cliente,
      zona: props.zona,
      fechaCreacion: props.fechaCreacion,
      fechaEntrega: props.fechaEntrega,
      estado: props.estado,
      repartidor: props.repartidor,
      metodoPago: props.metodoPago,
      monto: props.monto,
    };
  }
}
