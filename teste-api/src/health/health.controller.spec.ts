import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis.health-indicator';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheck: jest.Mocked<HealthCheckService>;

  beforeEach(async () => {
    const prismaMock = {
      $queryRawUnsafe: jest.fn().mockResolvedValue([{ 1: 1 }]),
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              info: {},
              error: {},
              details: {
                db: { status: 'up' },
                redis: { status: 'up' },
              },
            }),
          },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({ db: { status: 'up' } }),
          },
        },
        {
          provide: RedisHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
          },
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheck = module.get(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status with db and redis', async () => {
    const result = await controller.getHealth();
    expect(result.status).toBe('ok');
    expect(result.details).toHaveProperty('db');
    expect(result.details).toHaveProperty('redis');
    expect(result.details.db).toEqual({ status: 'up' });
    expect(result.details.redis).toEqual({ status: 'up' });
    expect(healthCheck.check).toHaveBeenCalled();
  });
});
