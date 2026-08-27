import { EstadoPedido } from './estado-pedido.enum';
import { Pedido } from './pedido.entity';
import { Zona } from './zona.enum';

export interface FiltrosPedido {
  estado?: EstadoPedido;
  zona?: Zona;
}

export const PEDIDO_REPOSITORY = Symbol('PEDIDO_REPOSITORY');

export interface PedidoRepository {
  guardar(pedido: Pedido): Promise<void>;
  buscarPorId(idPedido: string): Promise<Pedido | null>;
  buscarTodos(filtros: FiltrosPedido): Promise<Pedido[]>;
}
