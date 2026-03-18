import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthCheckError } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health-indicator';

const mockConnect = jest.fn();
const mockPing = jest.fn();
const mockQuit = jest.fn();

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: mockConnect,
    ping: mockPing,
    quit: mockQuit,
  })),
}));

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;

  beforeEach(async () => {
    mockConnect.mockResolvedValue(undefined);
    mockPing.mockResolvedValue('PONG');
    mockQuit.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisHealthIndicator,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, def?: string) =>
              key === 'REDIS_URL' ? 'redis://localhost:6379' : def,
            ),
          },
        },
      ],
    }).compile();

    indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should return up when Redis is healthy', async () => {
    const result = await indicator.pingCheck('redis');
    expect(result).toEqual({ redis: { status: 'up' } });
    expect(mockConnect).toHaveBeenCalled();
    expect(mockPing).toHaveBeenCalled();
    expect(mockQuit).toHaveBeenCalled();
  });

  it('should throw HealthCheckError when Redis ping fails', async () => {
    mockPing.mockRejectedValueOnce(new Error('Connection refused'));
    await expect(indicator.pingCheck('redis')).rejects.toThrow(
      HealthCheckError,
    );
  });
});
