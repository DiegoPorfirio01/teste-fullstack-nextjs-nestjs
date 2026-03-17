import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '../auth/auth.module';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RoleGuard } from './role.guard';
import { SessionGuard } from './session.guard';

@Module({
  imports: [
    AuthModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  providers: [CustomThrottlerGuard, JwtAuthGuard, RoleGuard, SessionGuard],
  exports: [CustomThrottlerGuard, JwtAuthGuard, RoleGuard, SessionGuard],
})
export class GuardsModule {}
