import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../domain/user-role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'cliente@ecodelivery.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'contraseñaSegura123', minLength: 8 })
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.Cliente })
  @IsEnum(UserRole)
  role: UserRole;
}
