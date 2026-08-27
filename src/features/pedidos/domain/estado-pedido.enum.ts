export enum EstadoPedido {
  Pendiente = 'pendiente',
  EnCamino = 'en_camino',
  Entregado = 'entregado',
  Cancelado = 'cancelado',
}

const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[]> = {
  [EstadoPedido.Pendiente]: [EstadoPedido.EnCamino, EstadoPedido.Cancelado],
  [EstadoPedido.EnCamino]: [EstadoPedido.Entregado, EstadoPedido.Cancelado],
  [EstadoPedido.Entregado]: [],
  [EstadoPedido.Cancelado]: [],
};

export function esTransicionValida(
  estadoActual: EstadoPedido,
  estadoNuevo: EstadoPedido,
): boolean {
  return TRANSICIONES_VALIDAS[estadoActual].includes(estadoNuevo);
}
