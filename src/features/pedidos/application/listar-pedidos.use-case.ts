import { Inject, Injectable } from '@nestjs/common';
import { PEDIDO_REPOSITORY } from '../domain/pedido.repository';
import type {
  FiltrosPedido,
  PedidoRepository,
} from '../domain/pedido.repository';
import { Pedido } from '../domain/pedido.entity';

@Injectable()
export class ListarPedidosUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: PedidoRepository,
  ) {}

  async ejecutar(filtros: FiltrosPedido): Promise<Pedido[]> {
    return this.pedidoRepository.buscarTodos(filtros);
  }
}
