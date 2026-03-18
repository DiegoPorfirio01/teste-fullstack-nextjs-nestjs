import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockPayload = {
    sub: 'user-1',
    email: 'john@test.com',
    role: 'user',
    iat: 1704067200,
    exp: 1704153600,
  };

  beforeEach(async () => {
    const authServiceMock = {
      validateJwtToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-jwt-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return JwtUser when payload is valid', async () => {
      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        userId: 'user-1',
        email: 'john@test.com',
        role: 'user',
      });
      expect(authService.validateJwtToken).not.toHaveBeenCalled();
    });

    it('should call validateJwtToken when payload has token field', async () => {
      authService.validateJwtToken.mockResolvedValue({});

      const result = await strategy.validate({
        ...mockPayload,
        token: 'refresh-token-123',
      });

      expect(result).toEqual({
        userId: 'user-1',
        email: 'john@test.com',
        role: 'user',
      });
      expect(authService.validateJwtToken).toHaveBeenCalledWith(
        'refresh-token-123',
      );
    });

    it('should throw UnauthorizedException when payload is null', async () => {
      await expect(strategy.validate(null as never)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(null as never)).rejects.toThrow(
        'Payload do token inválido',
      );
    });

    it('should throw UnauthorizedException when payload is undefined', async () => {
      await expect(strategy.validate(undefined as never)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should propagate error from validateJwtToken', async () => {
      authService.validateJwtToken.mockRejectedValue(
        new UnauthorizedException('Token expired'),
      );

      await expect(
        strategy.validate({ ...mockPayload, token: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
