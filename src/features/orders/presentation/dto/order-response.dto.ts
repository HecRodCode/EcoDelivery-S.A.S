import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../domain/order-status.enum';
import { PaymentMethod } from '../../domain/payment-method.enum';
import { Order } from '../../domain/order.entity';
import { Zone } from '../../domain/zone.enum';

export class OrderResponseDto {
  @ApiProperty()
  id_pedido: string;

  @ApiProperty()
  cliente: string;

  @ApiProperty({ enum: Zone })
  zona: Zone;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty({ nullable: true })
  fecha_entrega: Date | null;

  @ApiProperty({ enum: OrderStatus })
  estado: OrderStatus;

  @ApiProperty({ nullable: true })
  repartidor: string | null;

  @ApiProperty({ enum: PaymentMethod })
  metodo_pago: PaymentMethod;

  @ApiProperty()
  monto: number;

  static fromDomain(order: Order): OrderResponseDto {
    const props = order.toProps();
    const dto = new OrderResponseDto();

    dto.id_pedido = props.idPedido;
    dto.cliente = props.cliente;
    dto.zona = props.zona;
    dto.fecha_creacion = props.fechaCreacion;
    dto.fecha_entrega = props.fechaEntrega;
    dto.estado = props.estado;
    dto.repartidor = props.repartidor;
    dto.metodo_pago = props.metodoPago;
    dto.monto = props.monto;

    return dto;
  }
}
