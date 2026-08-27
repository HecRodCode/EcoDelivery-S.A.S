import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { Pedido } from '../domain/pedido.entity';
import {
  FiltrosPedido,
  PedidoRepository,
} from '../domain/pedido.repository';
import { PedidoPrismaMapper } from './pedido-prisma.mapper';

@Injectable()
export class PedidoPrismaRepository implements PedidoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(pedido: Pedido): Promise<void> {
    const data = PedidoPrismaMapper.aPersistencia(pedido);

    await this.prisma.pedido.upsert({
      where: { idPedido: data.idPedido },
      create: data,
      update: data,
    });
  }

  async buscarPorId(idPedido: string): Promise<Pedido | null> {
    const registro = await this.prisma.pedido.findUnique({
      where: { idPedido },
    });

    return registro ? PedidoPrismaMapper.aDominio(registro) : null;
  }

  async buscarTodos(filtros: FiltrosPedido): Promise<Pedido[]> {
    const registros = await this.prisma.pedido.findMany({
      where: {
        estado: filtros.estado,
        zona: filtros.zona,
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return registros.map(PedidoPrismaMapper.aDominio);
  }
}
