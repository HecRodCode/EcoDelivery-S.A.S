import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../domain/user-role.enum';
import { User } from '../../domain/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  static fromDomain(user: User): UserResponseDto {
    const props = user.toProps();
    const dto = new UserResponseDto();

    dto.id = props.id;
    dto.email = props.email;
    dto.role = props.role;

    return dto;
  }
}
