import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from './role.guard';
import { ROLES_KEY } from './decorators';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: jest.Mocked<Reflector>;

  const createMockContext = (user?: object): ExecutionContext => {
    const mockRequest = { user };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const reflectorMock = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: reflectorMock,
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no roles required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const context = createMockContext({ userId: 'u-1', role: 'user' });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue(['user', 'admin']);

      const context = createMockContext({
        userId: 'u-1',
        email: 'a@b.com',
        role: 'admin',
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when user is missing', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);
      const context = createMockContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Usuário não autorizado',
      );
    });

    it('should throw UnauthorizedException when user has no role', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);
      const context = createMockContext({ userId: 'u-1' });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Usuário não autorizado',
      );
    });

    it('should throw UnauthorizedException when user role does not match', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);
      const context = createMockContext({
        userId: 'u-1',
        email: 'a@b.com',
        role: 'user',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        /Usuário não possui a função necessária/,
      );
    });

    it('should call reflector with ROLES_KEY', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const context = createMockContext({ role: 'user' });
      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });
});
