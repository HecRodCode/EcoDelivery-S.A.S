export abstract class DomainError extends Error {}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} con id "${id}" no fue encontrado`);
  }
}

export class InvalidStatusTransitionError extends DomainError {
  constructor(currentStatus: string, newStatus: string) {
    super(
      `No se puede transicionar de estado "${currentStatus}" a "${newStatus}"`,
    );
  }
}

export class EmailAlreadyRegisteredError extends DomainError {
  constructor(email: string) {
    super(`El email "${email}" ya está registrado`);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Email o contraseña incorrectos');
  }
}
