import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoPedido } from '../../domain/estado-pedido.enum';

export class ActualizarEstadoPedidoDto {
  @ApiProperty({ enum: EstadoPedido, example: EstadoPedido.EnCamino })
  @IsEnum(EstadoPedido)
  estado!: EstadoPedido;
}
