import { InvalidStatusTransitionError } from '../../../shared/domain/domain.error';
import { isValidTransition, OrderStatus } from './order-status.enum';
import { PaymentMethod } from './payment-method.enum';
import { Zone } from './zone.enum';

export interface OrderProps {
  idPedido: string;
  cliente: string;
  zona: Zone;
  fechaCreacion: Date;
  fechaEntrega: Date | null;
  estado: OrderStatus;
  repartidor: string | null;
  metodoPago: PaymentMethod;
  monto: number;
}

export class Order {
  private constructor(private props: OrderProps) {}

  static create(props: {
    idPedido: string;
    cliente: string;
    zona: Zone;
    metodoPago: PaymentMethod;
    monto: number;
  }): Order {
    return new Order({
      idPedido: props.idPedido,
      cliente: props.cliente,
      zona: props.zona,
      fechaCreacion: new Date(),
      fechaEntrega: null,
      estado: OrderStatus.Pendiente,
      repartidor: null,
      metodoPago: props.metodoPago,
      monto: props.monto,
    });
  }

  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  transitionStatusTo(newStatus: OrderStatus): void {
    if (!isValidTransition(this.props.estado, newStatus)) {
      throw new InvalidStatusTransitionError(this.props.estado, newStatus);
    }

    this.props.estado = newStatus;

    if (newStatus === OrderStatus.Entregado) {
      this.props.fechaEntrega = new Date();
    }
  }

  toProps(): OrderProps {
    return { ...this.props };
  }
}
