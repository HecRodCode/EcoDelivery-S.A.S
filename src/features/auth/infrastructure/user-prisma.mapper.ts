import { Prisma, User as UserRecord } from '@prisma/client';
import { UserRole } from '../domain/user-role.enum';
import { User } from '../domain/user.entity';

export class UserPrismaMapper {
  static toDomain(record: UserRecord): User {
    return User.reconstitute({
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      role: record.role as UserRole,
      createdAt: record.createdAt,
    });
  }

  static toPersistence(user: User): Prisma.UserCreateInput {
    const props = user.toProps();

    return {
      id: props.id,
      email: props.email,
      passwordHash: props.passwordHash,
      role: props.role,
      createdAt: props.createdAt,
    };
  }
}
