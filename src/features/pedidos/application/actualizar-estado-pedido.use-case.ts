import { Inject, Injectable } from '@nestjs/common';
import { EntidadNoEncontradaError } from '../../../shared/domain/domain.error';
import { EstadoPedido } from '../domain/estado-pedido.enum';
import { Pedido } from '../domain/pedido.entity';
import { PEDIDO_REPOSITORY } from '../domain/pedido.repository';
import type { PedidoRepository } from '../domain/pedido.repository';

@Injectable()
export class ActualizarEstadoPedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: PedidoRepository,
  ) {}

  async ejecutar(idPedido: string, nuevoEstado: EstadoPedido): Promise<Pedido> {
    const pedido = await this.pedidoRepository.buscarPorId(idPedido);

    if (!pedido) {
      throw new EntidadNoEncontradaError('Pedido', idPedido);
    }

    pedido.transicionarEstadoA(nuevoEstado);
    await this.pedidoRepository.guardar(pedido);

    return pedido;
  }
}
