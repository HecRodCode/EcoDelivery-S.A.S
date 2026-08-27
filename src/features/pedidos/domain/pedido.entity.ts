import { TransicionEstadoInvalidaError } from '../../../shared/domain/domain.error';
import { EstadoPedido, esTransicionValida } from './estado-pedido.enum';
import { MetodoPago } from './metodo-pago.enum';
import { Zona } from './zona.enum';

export interface PedidoProps {
  idPedido: string;
  cliente: string;
  zona: Zona;
  fechaCreacion: Date;
  fechaEntrega: Date | null;
  estado: EstadoPedido;
  repartidor: string | null;
  metodoPago: MetodoPago;
  monto: number;
}

export class Pedido {
  private constructor(private props: PedidoProps) {}

  static crear(props: {
    idPedido: string;
    cliente: string;
    zona: Zona;
    metodoPago: MetodoPago;
    monto: number;
  }): Pedido {
    return new Pedido({
      idPedido: props.idPedido,
      cliente: props.cliente,
      zona: props.zona,
      fechaCreacion: new Date(),
      fechaEntrega: null,
      estado: EstadoPedido.Pendiente,
      repartidor: null,
      metodoPago: props.metodoPago,
      monto: props.monto,
    });
  }

  static reconstruir(props: PedidoProps): Pedido {
    return new Pedido(props);
  }

  transicionarEstadoA(nuevoEstado: EstadoPedido): void {
    if (!esTransicionValida(this.props.estado, nuevoEstado)) {
      throw new TransicionEstadoInvalidaError(this.props.estado, nuevoEstado);
    }

    this.props.estado = nuevoEstado;

    if (nuevoEstado === EstadoPedido.Entregado) {
      this.props.fechaEntrega = new Date();
    }
  }

  toProps(): PedidoProps {
    return { ...this.props };
  }
}
