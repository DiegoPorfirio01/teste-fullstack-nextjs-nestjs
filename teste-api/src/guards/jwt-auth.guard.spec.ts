import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from './decorators';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  const createMockContext = (
    overrides?: Partial<ExecutionContext>,
  ): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
      ...overrides,
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    const reflectorMock = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: reflectorMock,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate - public route bypass', () => {
    it('should return true when route is marked as public', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const context = createMockContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should delegate to parent when route is NOT public', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      const parent = Object.getPrototypeOf(guard);
      jest.spyOn(parent, 'canActivate').mockResolvedValue(true);

      const context = createMockContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should call super.canActivate when IS_PUBLIC_KEY is undefined', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const parent = Object.getPrototypeOf(guard);
      jest.spyOn(parent, 'canActivate').mockResolvedValue(true);

      const context = createMockContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should throw UnauthorizedException when user is false', () => {
      expect(() => guard.handleRequest(null, false)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is undefined/null', () => {
      expect(() => guard.handleRequest(null, undefined as never)).toThrow(
        UnauthorizedException,
      );
    });

    it('should rethrow error when err is provided', () => {
      const err = new Error('Token expired');
      expect(() => guard.handleRequest(err, {} as never)).toThrow(err);
    });

    it('should return user when valid', () => {
      const user = { userId: 'u-1', email: 'a@b.com', role: 'user' };
      const result = guard.handleRequest(null, user);
      expect(result).toEqual(user);
    });
  });
});
