import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoPedido } from '../../domain/estado-pedido.enum';
import { Zona } from '../../domain/zona.enum';

export class ListarPedidosQueryDto {
  @ApiPropertyOptional({ enum: EstadoPedido })
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;

  @ApiPropertyOptional({ enum: Zona })
  @IsOptional()
  @IsEnum(Zona)
  zona?: Zona;
}
