import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActualizarEstadoPedidoUseCase } from '../application/actualizar-estado-pedido.use-case';
import { CrearPedidoUseCase } from '../application/crear-pedido.use-case';
import { ListarPedidosUseCase } from '../application/listar-pedidos.use-case';
import { ObtenerPedidoUseCase } from '../application/obtener-pedido.use-case';
import { ActualizarEstadoPedidoDto } from './dto/actualizar-estado-pedido.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { ListarPedidosQueryDto } from './dto/listar-pedidos-query.dto';
import { PedidoRespuestaDto } from './dto/pedido-respuesta.dto';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly crearPedidoUseCase: CrearPedidoUseCase,
    private readonly listarPedidosUseCase: ListarPedidosUseCase,
    private readonly obtenerPedidoUseCase: ObtenerPedidoUseCase,
    private readonly actualizarEstadoPedidoUseCase: ActualizarEstadoPedidoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: PedidoRespuestaDto })
  async crear(@Body() dto: CrearPedidoDto): Promise<PedidoRespuestaDto> {
    const pedido = await this.crearPedidoUseCase.ejecutar(dto);
    return PedidoRespuestaDto.desdeDominio(pedido);
  }

  @Get()
  @ApiOkResponse({ type: PedidoRespuestaDto, isArray: true })
  async listar(
    @Query() query: ListarPedidosQueryDto,
  ): Promise<PedidoRespuestaDto[]> {
    const pedidos = await this.listarPedidosUseCase.ejecutar(query);
    return pedidos.map(PedidoRespuestaDto.desdeDominio);
  }

  @Get(':id')
  @ApiOkResponse({ type: PedidoRespuestaDto })
  @ApiNotFoundResponse({ description: 'El pedido no existe' })
  async obtener(@Param('id') id: string): Promise<PedidoRespuestaDto> {
    const pedido = await this.obtenerPedidoUseCase.ejecutar(id);
    return PedidoRespuestaDto.desdeDominio(pedido);
  }

  @Patch(':id/estado')
  @ApiOkResponse({ type: PedidoRespuestaDto })
  @ApiNotFoundResponse({ description: 'El pedido no existe' })
  @ApiConflictResponse({ description: 'Transición de estado inválida' })
  async actualizarEstado(
    @Param('id') id: string,
    @Body() dto: ActualizarEstadoPedidoDto,
  ): Promise<PedidoRespuestaDto> {
    const pedido = await this.actualizarEstadoPedidoUseCase.ejecutar(
      id,
      dto.estado,
    );
    return PedidoRespuestaDto.desdeDominio(pedido);
  }
}
