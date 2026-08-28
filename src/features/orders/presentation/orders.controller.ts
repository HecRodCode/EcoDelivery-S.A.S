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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../auth/domain/user-role.enum';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { CreateOrderUseCase } from '../application/create-order.use-case';
import { GetOrderUseCase } from '../application/get-order.use-case';
import { ListOrdersUseCase } from '../application/list-orders.use-case';
import { UpdateOrderStatusUseCase } from '../application/update-order-status.use-case';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('pedidos')
@ApiBearerAuth()
@Controller('pedidos')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  @Post()
  @Roles(UserRole.Cliente)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: OrderResponseDto })
  @ApiForbiddenResponse({ description: 'Requiere rol cliente' })
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = await this.createOrderUseCase.execute({
      cliente: dto.cliente,
      zona: dto.zona,
      metodoPago: dto.metodo_pago,
      monto: dto.monto,
    });
    return OrderResponseDto.fromDomain(order);
  }

  @Get()
  @ApiOkResponse({ type: OrderResponseDto, isArray: true })
  async list(
    @Query() query: ListOrdersQueryDto,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.listOrdersUseCase.execute(query);
    return orders.map(OrderResponseDto.fromDomain);
  }

  @Get(':id')
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'El pedido no existe' })
  async getById(@Param('id') id: string): Promise<OrderResponseDto> {
    const order = await this.getOrderUseCase.execute(id);
    return OrderResponseDto.fromDomain(order);
  }

  @Patch(':id/estado')
  @Roles(UserRole.Repartidor)
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'El pedido no existe' })
  @ApiConflictResponse({ description: 'Transición de estado inválida' })
  @ApiForbiddenResponse({ description: 'Requiere rol repartidor' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.updateOrderStatusUseCase.execute(id, dto.estado);
    return OrderResponseDto.fromDomain(order);
  }
}
