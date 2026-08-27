import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MetodoPago } from '../domain/metodo-pago.enum';
import { Pedido } from '../domain/pedido.entity';
import { PEDIDO_REPOSITORY } from '../domain/pedido.repository';
import type { PedidoRepository } from '../domain/pedido.repository';
import { Zona } from '../domain/zona.enum';

export interface CrearPedidoInput {
  cliente: string;
  zona: Zona;
  metodoPago: MetodoPago;
  monto: number;
}

@Injectable()
export class CrearPedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: PedidoRepository,
  ) {}

  async ejecutar(input: CrearPedidoInput): Promise<Pedido> {
    const pedido = Pedido.crear({
      idPedido: randomUUID(),
      cliente: input.cliente,
      zona: input.zona,
      metodoPago: input.metodoPago,
      monto: input.monto,
    });

    await this.pedidoRepository.guardar(pedido);

    return pedido;
  }
}
