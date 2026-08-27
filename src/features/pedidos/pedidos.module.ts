import { Module } from '@nestjs/common';
import { ActualizarEstadoPedidoUseCase } from './application/actualizar-estado-pedido.use-case';
import { CrearPedidoUseCase } from './application/crear-pedido.use-case';
import { ListarPedidosUseCase } from './application/listar-pedidos.use-case';
import { ObtenerPedidoUseCase } from './application/obtener-pedido.use-case';
import { PEDIDO_REPOSITORY } from './domain/pedido.repository';
import { PedidoPrismaRepository } from './infrastructure/pedido-prisma.repository';
import { PedidosController } from './presentation/pedidos.controller';

@Module({
  controllers: [PedidosController],
  providers: [
    CrearPedidoUseCase,
    ListarPedidosUseCase,
    ObtenerPedidoUseCase,
    ActualizarEstadoPedidoUseCase,
    { provide: PEDIDO_REPOSITORY, useClass: PedidoPrismaRepository },
  ],
})
export class PedidosModule {}
