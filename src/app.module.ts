import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GuardsModule } from './guards';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HealthModule } from './health/health.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { ObservabilityMiddleware } from './middleware/observability.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GuardsModule,
    HealthModule,
    MiddlewareModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ObservabilityMiddleware).forRoutes('*');
  }
}
