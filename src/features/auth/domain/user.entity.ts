import { UserRole } from './user-role.enum';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(props: {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): User {
    return new User({
      id: props.id,
      email: props.email,
      passwordHash: props.passwordHash,
      role: props.role,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  toProps(): UserProps {
    return { ...this.props };
  }
}
