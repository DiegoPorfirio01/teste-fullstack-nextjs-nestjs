import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async pingCheck(
    key: string,
    options?: { timeout?: number },
  ): Promise<HealthIndicatorResult> {
    const timeout = options?.timeout ?? 1000;
    const redisUrl = this.config.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    let client: RedisClientType | undefined;

    try {
      client = createClient({ url: redisUrl });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`timeout of ${timeout}ms exceeded`)),
          timeout,
        ),
      );
      const connectAndPing = async () => {
        await client!.connect();
        await client!.ping();
        await client!.quit();
      };
      await Promise.race([connectAndPing(), timeoutPromise]);
      return this.getStatus(key, true);
    } catch (err) {
      if (client) {
        try {
          await client.quit();
        } catch {
          /* ignore quit error */
        }
      }
      const msg =
        err instanceof Error ? err.message : `${key} is not available`;
      throw new HealthCheckError(
        `${key} check failed`,
        this.getStatus(key, false, { error: msg }),
      );
    }
  }
}
