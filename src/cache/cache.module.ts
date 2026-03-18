import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>(
          'REDIS_URL',
          'redis://localhost:6379',
        );
        const redisStore = new Keyv({
          store: new KeyvRedis(redisUrl),
          namespace: 'teste-api',
        });
        return {
          stores: [redisStore],
          ttl: 60 * 1000,
        };
      },
    }),
  ],
})
export class CacheModule {}
