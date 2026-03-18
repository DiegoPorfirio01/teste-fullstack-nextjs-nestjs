import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockLoginResponse = {
  user: {
    id: 'user-1',
    name: 'John',
    email: 'john@test.com',
    createdAt: '2024-01-01',
  },
  accessToken: 'jwt-token',
};

const mockProfileResponse = {
  id: 'user-1',
  fullName: 'John',
  email: 'john@test.com',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
            updatePassword: jest.fn(),
            deleteAccount: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      authService.register.mockResolvedValue(mockLoginResponse);

      const result = await controller.register({
        email: 'john@test.com',
        password: 'secret',
        name: 'John',
      });

      expect(result).toEqual(mockLoginResponse);
      expect(authService.register).toHaveBeenCalledWith({
        email: 'john@test.com',
        password: 'secret',
        name: 'John',
      });
    });
  });

  describe('login', () => {
    it('should call authService.login with dto', async () => {
      authService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login({
        email: 'john@test.com',
        password: 'secret',
      });

      expect(result).toEqual(mockLoginResponse);
      expect(authService.login).toHaveBeenCalledWith('john@test.com', 'secret');
    });
  });

  describe('getProfile', () => {
    it('should return profile for current user', async () => {
      authService.getProfile.mockResolvedValue(mockProfileResponse);

      const mockUser = {
        userId: 'user-1',
        email: 'test@test.com',
        role: 'user',
      };
      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockProfileResponse);
      expect(authService.getProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile', async () => {
      authService.updateProfile.mockResolvedValue(mockProfileResponse);

      const mockUser = {
        userId: 'user-1',
        email: 'test@test.com',
        role: 'user',
      };
      const result = await controller.updateProfile(mockUser, {
        fullName: 'John Updated',
      });

      expect(result).toEqual(mockProfileResponse);
      expect(authService.updateProfile).toHaveBeenCalledWith(
        'user-1',
        'John Updated',
      );
    });
  });

  describe('updatePassword', () => {
    it('should call authService and return message', async () => {
      authService.updatePassword.mockResolvedValue(undefined);

      const mockUser = {
        userId: 'user-1',
        email: 'test@test.com',
        role: 'user',
      };
      const result = await controller.updatePassword(mockUser, {
        currentPassword: 'current',
        newPassword: 'new',
      });

      expect(result).toEqual({ message: 'Senha atualizada' });
      expect(authService.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'current',
        'new',
      );
    });
  });

  describe('deleteAccount', () => {
    it('should call authService and return message', async () => {
      authService.deleteAccount.mockResolvedValue(undefined);

      const mockUser = {
        userId: 'user-1',
        email: 'test@test.com',
        role: 'user',
      };
      const result = await controller.deleteAccount(mockUser);

      expect(result).toEqual({ message: 'Conta excluída' });
      expect(authService.deleteAccount).toHaveBeenCalledWith('user-1');
    });
  });
});
