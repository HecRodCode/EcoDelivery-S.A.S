import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { JwtAuthGuard } from './features/auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from './features/auth/presentation/guards/roles.guard';
import { OrdersModule } from './features/orders/orders.module';
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
    AuthModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: DomainErrorFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
