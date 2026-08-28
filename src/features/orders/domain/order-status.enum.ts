export enum OrderStatus {
  Pendiente = 'pendiente',
  EnCamino = 'en_camino',
  Entregado = 'entregado',
  Cancelado = 'cancelado',
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pendiente]: [OrderStatus.EnCamino, OrderStatus.Cancelado],
  [OrderStatus.EnCamino]: [OrderStatus.Entregado, OrderStatus.Cancelado],
  [OrderStatus.Entregado]: [],
  [OrderStatus.Cancelado]: [],
};

export function isValidTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(newStatus);
}
