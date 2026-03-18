import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';

const mockUser = {
  id: 'user-1',
  email: 'john@test.com',
  passwordHash: 'hashed',
  name: 'John',
  role: 'user',
  status: 'active',
  createdAt: new Date('2024-01-01'),
};

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await repository.findByEmail('john@test.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@test.com' },
      });
    });

    it('should lowercase email when searching', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      await repository.findByEmail('John@Test.COM');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@test.com' },
      });
    });

    it('should return null when not found', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await repository.findByEmail('unknown@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await repository.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should return null when not found', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await repository.findById('unknown');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user with lowercase email and trimmed name', async () => {
      jest.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const result = await repository.create({
        email: 'John@Test.COM',
        passwordHash: 'hashed',
        name: '  John  ',
      });

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'john@test.com',
          passwordHash: 'hashed',
          name: 'John',
          role: 'user',
          status: 'active',
        },
      });
    });
  });

  describe('updatePassword', () => {
    it('should call prisma update', async () => {
      jest.mocked(prisma.user.update).mockResolvedValue(mockUser);

      await repository.updatePassword('user-1', 'newHash');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: 'newHash' },
      });
    });
  });

  describe('updateProfile', () => {
    it('should update name and return user', async () => {
      const updated = { ...mockUser, name: 'John Updated' };
      jest.mocked(prisma.user.update).mockResolvedValue(updated);

      const result = await repository.updateProfile(
        'user-1',
        '  John Updated  ',
      );

      expect(result).toEqual(updated);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'John Updated' },
      });
    });
  });

  describe('delete', () => {
    it('should call prisma delete', async () => {
      jest.mocked(prisma.user.delete).mockResolvedValue(mockUser);

      await repository.delete('user-1');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });
  });
});
