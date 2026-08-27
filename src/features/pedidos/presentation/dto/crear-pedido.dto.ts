import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { MetodoPago } from '../../domain/metodo-pago.enum';
import { Zona } from '../../domain/zona.enum';

export class CrearPedidoDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  cliente: string;

  @ApiProperty({ enum: Zona, example: Zona.Centro })
  @IsEnum(Zona)
  zona: Zona;

  @ApiProperty({ enum: MetodoPago, example: MetodoPago.Efectivo })
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @IsPositive()
  monto: number;
}
