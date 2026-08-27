import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PedidosModule } from './features/pedidos/pedidos.module';
import { validateEnv } from './shared/config/env';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { DomainErrorFilter } from './shared/presentation/domain-error.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: DomainErrorFilter },
  ],
})
export class AppModule {}
