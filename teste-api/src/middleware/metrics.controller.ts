import { Controller, Get, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Public } from '../guards/decorators';

/**
 * Custom Prometheus metrics controller that exposes /v1/metrics as public.
 * Uses @Public() instead of hardcoding bypass in JwtAuthGuard.
 */
@Controller()
@Public()
export class MetricsController extends PrometheusController {
  @Get()
  index(@Res({ passthrough: true }) response: FastifyReply): Promise<string> {
    return super.index(response);
  }
}
