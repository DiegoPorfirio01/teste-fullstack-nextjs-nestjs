import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { AppService } from './app.service';
import { CacheModule } from './cache/cache.module';
import { CreditsModule } from './credits/credits.module';
import { GuardsModule } from './guards';
import { PrismaModule } from './prisma/prisma.module';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HealthModule } from './health/health.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { ObservabilityMiddleware } from './middleware/observability.middleware';
import { TransactionsModule } from './transactions/transactions.module';
import { WalletModule } from './wallet/wallet.module';

const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(1),
  JWT_EXPIRES_IN: Joi.string().optional().default('24h'),
  REDIS_URL: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
    }),
    CacheModule,
    PrismaModule,
    CreditsModule,
    GuardsModule,
    HealthModule,
    MiddlewareModule,
    TransactionsModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ObservabilityMiddleware).forRoutes('*');
  }
}
