import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  async getReadyStatus(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  async getLiveStatus(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
  }> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
