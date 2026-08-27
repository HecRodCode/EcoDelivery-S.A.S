import { Pedido as PedidoPrisma, Prisma } from '@prisma/client';
import { EstadoPedido } from '../domain/estado-pedido.enum';
import { MetodoPago } from '../domain/metodo-pago.enum';
import { Pedido } from '../domain/pedido.entity';
import { Zona } from '../domain/zona.enum';

export class PedidoPrismaMapper {
  static aDominio(registro: PedidoPrisma): Pedido {
    return Pedido.reconstruir({
      idPedido: registro.idPedido,
      cliente: registro.cliente,
      zona: registro.zona as Zona,
      fechaCreacion: registro.fechaCreacion,
      fechaEntrega: registro.fechaEntrega,
      estado: registro.estado as EstadoPedido,
      repartidor: registro.repartidor,
      metodoPago: registro.metodoPago as MetodoPago,
      monto: registro.monto.toNumber(),
    });
  }

  static aPersistencia(pedido: Pedido): Prisma.PedidoCreateInput {
    const props = pedido.toProps();

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
