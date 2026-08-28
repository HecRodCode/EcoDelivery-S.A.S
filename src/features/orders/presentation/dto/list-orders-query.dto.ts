import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../domain/order-status.enum';
import { Zone } from '../../domain/zone.enum';

export class ListOrdersQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  estado?: OrderStatus;

  @ApiPropertyOptional({ enum: Zone })
  @IsOptional()
  @IsEnum(Zone)
  zona?: Zone;
}
