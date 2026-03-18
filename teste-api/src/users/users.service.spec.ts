import { ConflictException, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUserEntity = {
  id: 'user-1',
  email: 'john@test.com',
  passwordHash: 'hashed',
  name: 'John',
  role: 'user',
  status: 'active',
  createdAt: new Date('2024-01-01'),
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updatePassword: jest.fn(),
            updateProfile: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUserEntity);

      const result = await service.findByEmail('john@test.com');

      expect(result).toEqual({
        ...mockUserEntity,
        createdAt: mockUserEntity.createdAt.toISOString(),
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@test.com');
    });

    it('should return null when not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      userRepository.findById.mockResolvedValue(mockUserEntity);

      const result = await service.findById('user-1');

      expect(result).toEqual({
        ...mockUserEntity,
        createdAt: mockUserEntity.createdAt.toISOString(),
      });
    });

    it('should return null when not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await service.findById('unknown');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return user', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed123');
      userRepository.create.mockResolvedValue(mockUserEntity);

      const result = await service.create({
        email: 'john@test.com',
        password: 'secret123',
        name: 'John',
      });

      expect(result).toEqual({
        ...mockUserEntity,
        createdAt: mockUserEntity.createdAt.toISOString(),
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@test.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'john@test.com',
        passwordHash: 'hashed123',
        name: 'John',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUserEntity);

      await expect(
        service.create({
          email: 'john@test.com',
          password: 'secret',
          name: 'John',
        }),
      ).rejects.toThrow(ConflictException);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should update password when current password is valid', async () => {
      userRepository.findById.mockResolvedValue(mockUserEntity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashed');

      await service.updatePassword('user-1', 'current', 'newPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('current', 'hashed');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(userRepository.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'newHashed',
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.updatePassword('unknown', 'current', 'new'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when current password is invalid', async () => {
      userRepository.findById.mockResolvedValue(mockUserEntity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword('user-1', 'wrong', 'new'),
      ).rejects.toThrow(ConflictException);
      expect(userRepository.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update and return user', async () => {
      const updatedEntity = { ...mockUserEntity, name: 'John Updated' };
      userRepository.updateProfile.mockResolvedValue(updatedEntity);

      const result = await service.updateProfile('user-1', 'John Updated');

      expect(result).toEqual({
        ...updatedEntity,
        createdAt: updatedEntity.createdAt.toISOString(),
      });
      expect(userRepository.updateProfile).toHaveBeenCalledWith(
        'user-1',
        'John Updated',
      );
    });
  });

  describe('delete', () => {
    it('should call repository delete', async () => {
      userRepository.delete.mockResolvedValue(undefined);

      await service.delete('user-1');

      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    });
  });

  describe('validatePassword', () => {
    it('should return true when password matches', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword('plain', 'hash');

      expect(result).toBe(true);
    });

    it('should return false when password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword('wrong', 'hash');

      expect(result).toBe(false);
    });
  });
});
