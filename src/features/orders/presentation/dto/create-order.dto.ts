import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../../domain/payment-method.enum';
import { Zone } from '../../domain/zone.enum';

export class CreateOrderDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  cliente: string;

  @ApiProperty({ enum: Zone, example: Zone.Centro })
  @IsEnum(Zone)
  zona: Zone;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.Efectivo })
  @IsEnum(PaymentMethod)
  metodo_pago: PaymentMethod;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @IsPositive()
  monto: number;
}
