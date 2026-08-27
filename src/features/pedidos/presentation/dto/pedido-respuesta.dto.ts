import { ApiProperty } from '@nestjs/swagger';
import { EstadoPedido } from '../../domain/estado-pedido.enum';
import { MetodoPago } from '../../domain/metodo-pago.enum';
import { Pedido } from '../../domain/pedido.entity';
import { Zona } from '../../domain/zona.enum';

export class PedidoRespuestaDto {
  @ApiProperty()
  idPedido: string;

  @ApiProperty()
  cliente: string;

  @ApiProperty({ enum: Zona })
  zona: Zona;

  @ApiProperty()
  fechaCreacion: Date;

  @ApiProperty({ nullable: true })
  fechaEntrega: Date | null;

  @ApiProperty({ enum: EstadoPedido })
  estado: EstadoPedido;

  @ApiProperty({ nullable: true })
  repartidor: string | null;

  @ApiProperty({ enum: MetodoPago })
  metodoPago: MetodoPago;

  @ApiProperty()
  monto: number;

  static desdeDominio(pedido: Pedido): PedidoRespuestaDto {
    const props = pedido.toProps();
    const dto = new PedidoRespuestaDto();

    dto.idPedido = props.idPedido;
    dto.cliente = props.cliente;
    dto.zona = props.zona;
    dto.fechaCreacion = props.fechaCreacion;
    dto.fechaEntrega = props.fechaEntrega;
    dto.estado = props.estado;
    dto.repartidor = props.repartidor;
    dto.metodoPago = props.metodoPago;
    dto.monto = props.monto;

    return dto;
  }
}
