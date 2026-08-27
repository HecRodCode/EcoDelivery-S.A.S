export abstract class DomainError extends Error {}

export class EntidadNoEncontradaError extends DomainError {
  constructor(entidad: string, id: string) {
    super(`${entidad} con id "${id}" no fue encontrado`);
  }
}

export class TransicionEstadoInvalidaError extends DomainError {
  constructor(estadoActual: string, estadoNuevo: string) {
    super(
      `No se puede transicionar de estado "${estadoActual}" a "${estadoNuevo}"`,
    );
  }
}
