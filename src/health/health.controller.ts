import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../guards/decorators';
import { PrismaService } from '../prisma/prisma.service';
import { RedisHealthIndicator } from './redis.health-indicator';

@ApiTags('health')
@SkipThrottle()
@Public()
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check da API' })
  @ApiResponse({ status: 200, description: 'API está saudável' })
  @ApiResponse({
    status: 503,
    description: 'API ou dependências indisponíveis',
  })
  getHealth() {
    return this.health.check([
      () => this.prisma.pingCheck('db', this.prismaService),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
