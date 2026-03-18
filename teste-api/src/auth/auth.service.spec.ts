import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const mockUser = {
  id: 'user-1',
  email: 'john@test.com',
  passwordHash: 'hashed',
  name: 'John',
  role: 'user',
  status: 'active',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            validatePassword: jest.fn(),
            updatePassword: jest.fn(),
            updateProfile: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create user and return login response', async () => {
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'john@test.com',
        password: 'secret',
        name: 'John',
      });

      expect(result).toEqual({
        user: {
          id: 'user-1',
          name: 'John',
          email: 'john@test.com',
          createdAt: mockUser.createdAt,
        },
        accessToken: 'jwt-token',
      });
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'john@test.com',
        password: 'secret',
        name: 'John',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'john@test.com',
        role: 'user',
      });
    });
  });

  describe('login', () => {
    it('should return login response when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);

      const result = await service.login('john@test.com', 'secret');

      expect(result).toEqual({
        user: {
          id: 'user-1',
          name: 'John',
          email: 'john@test.com',
          createdAt: mockUser.createdAt,
        },
        accessToken: 'jwt-token',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('unknown@test.com', 'secret')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.validatePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(false);

      await expect(service.login('john@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateJwtToken', () => {
    it('should return payload when token is valid', async () => {
      const payload = { sub: 'user-1', email: 'john@test.com' };
      jwtService.verify.mockReturnValue(payload);

      const result = await service.validateJwtToken('valid-token');

      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => service.validateJwtToken('invalid')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return profile when user exists', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result).toEqual({
        id: 'user-1',
        fullName: 'John',
        email: 'john@test.com',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.getProfile('unknown')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile', async () => {
      const updatedUser = { ...mockUser, name: 'John Updated' };
      usersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-1', 'John Updated');

      expect(result).toEqual({
        id: 'user-1',
        fullName: 'John Updated',
        email: 'john@test.com',
      });
    });
  });

  describe('updatePassword', () => {
    it('should delegate to usersService', async () => {
      usersService.updatePassword.mockResolvedValue(undefined);

      await service.updatePassword('user-1', 'current', 'new');

      expect(usersService.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'current',
        'new',
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delegate to usersService', async () => {
      usersService.delete.mockResolvedValue(undefined);

      await service.deleteAccount('user-1');

      expect(usersService.delete).toHaveBeenCalledWith('user-1');
    });
  });
});
