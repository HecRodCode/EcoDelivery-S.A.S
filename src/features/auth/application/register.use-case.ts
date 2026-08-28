import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EmailAlreadyRegisteredError } from '../../../shared/domain/domain.error';
import { UserRole } from '../domain/user-role.enum';
import { User } from '../domain/user.entity';
import { USER_REPOSITORY } from '../domain/user.repository';
import type { UserRepository } from '../domain/user.repository';
import { PASSWORD_HASHER } from './password-hasher';
import type { PasswordHasher } from './password-hasher';

export interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new EmailAlreadyRegisteredError(input.email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: randomUUID(),
      email: input.email,
      passwordHash,
      role: input.role,
    });

    await this.userRepository.save(user);

    return user;
  }
}
