import { Inject, Injectable } from '@nestjs/common';
import { EntidadNoEncontradaError } from '../../../shared/domain/domain.error';
import { Pedido } from '../domain/pedido.entity';
import { PEDIDO_REPOSITORY } from '../domain/pedido.repository';
import type { PedidoRepository } from '../domain/pedido.repository';

@Injectable()
export class ObtenerPedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: PedidoRepository,
  ) {}

  async ejecutar(idPedido: string): Promise<Pedido> {
    const pedido = await this.pedidoRepository.buscarPorId(idPedido);

    if (!pedido) {
      throw new EntidadNoEncontradaError('Pedido', idPedido);
    }

    return pedido;
  }
}
