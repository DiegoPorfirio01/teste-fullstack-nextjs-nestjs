import { BadRequestException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WalletRepository } from './wallet.repository';

const mockWallet = {
  id: 'w-1',
  userId: 'user-1',
  balance: new Prisma.Decimal(100),
  updatedAt: new Date('2024-01-01'),
};

describe('WalletRepository', () => {
  let repository: WalletRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock = {
      wallet: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<WalletRepository>(WalletRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return wallet when found', async () => {
      jest.mocked(prisma.wallet.findUnique).mockResolvedValue(mockWallet);

      const result = await repository.findByUserId('user-1');

      expect(result).toEqual(mockWallet);
      expect(prisma.wallet.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should return null when not found', async () => {
      jest.mocked(prisma.wallet.findUnique).mockResolvedValue(null);

      const result = await repository.findByUserId('user-1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create wallet with default balance 0', async () => {
      const created = {
        ...mockWallet,
        balance: new Prisma.Decimal(0),
      };
      jest.mocked(prisma.wallet.create).mockResolvedValue(created);

      const result = await repository.create('user-1');

      expect(result).toEqual(created);
      expect(prisma.wallet.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', balance: 0 },
      });
    });

    it('should create wallet with custom balance', async () => {
      const created = {
        ...mockWallet,
        balance: new Prisma.Decimal(50),
      };
      jest.mocked(prisma.wallet.create).mockResolvedValue(created);

      await repository.create('user-1', 50);

      expect(prisma.wallet.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', balance: 50 },
      });
    });
  });

  describe('getOrCreate', () => {
    it('should return existing wallet when found', async () => {
      jest.mocked(prisma.wallet.findUnique).mockResolvedValue(mockWallet);

      const result = await repository.getOrCreate('user-1');

      expect(result).toEqual(mockWallet);
      expect(prisma.wallet.create).not.toHaveBeenCalled();
    });

    it('should create wallet when not found', async () => {
      jest.mocked(prisma.wallet.findUnique).mockResolvedValue(null);
      jest.mocked(prisma.wallet.create).mockResolvedValue(mockWallet);

      const result = await repository.getOrCreate('user-1');

      expect(result).toEqual(mockWallet);
      expect(prisma.wallet.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', balance: 0 },
      });
    });
  });

  describe('addBalance', () => {
    it('should increment balance and return updated wallet', async () => {
      jest.mocked(prisma.wallet.findUnique).mockResolvedValue(mockWallet);
      const updated = {
        ...mockWallet,
        balance: new Prisma.Decimal(150),
      };
      jest.mocked(prisma.wallet.update).mockResolvedValue(updated);

      const result = await repository.addBalance('user-1', 50);

      expect(result).toEqual(updated);
      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { balance: { increment: 50 } },
      });
    });

    it('should create wallet if not exists before adding', async () => {
      jest.mocked(prisma.wallet.findUnique).mockResolvedValue(null);
      jest.mocked(prisma.wallet.create).mockResolvedValue(mockWallet);
      const updated = {
        ...mockWallet,
        balance: new Prisma.Decimal(50),
      };
      jest.mocked(prisma.wallet.update).mockResolvedValue(updated);

      await repository.addBalance('user-1', 50);

      expect(prisma.wallet.create).toHaveBeenCalled();
      expect(prisma.wallet.update).toHaveBeenCalled();
    });
  });

  describe('subtractBalance', () => {
    it('should subtract and return updated wallet when sufficient balance', async () => {
      const rows = [{ id: 'w-1', user_id: 'user-1', balance: 50 }];
      jest.mocked(prisma.$queryRaw).mockResolvedValue(rows);

      const result = await repository.subtractBalance('user-1', 50);

      expect(result).toEqual({
        id: 'w-1',
        userId: 'user-1',
        balance: 50,
      });
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      jest.mocked(prisma.$queryRaw).mockResolvedValue([]);

      await expect(repository.subtractBalance('user-1', 200)).rejects.toThrow(
        BadRequestException,
      );
      await expect(repository.subtractBalance('user-1', 200)).rejects.toThrow(
        'Saldo insuficiente',
      );
    });
  });

  describe('getBalance', () => {
    it('should return balance as number', async () => {
      jest.mocked(prisma.wallet.findUnique).mockResolvedValue(mockWallet);

      const result = await repository.getBalance('user-1');

      expect(result).toBe(100);
    });

    it('should create wallet when not found and return balance', async () => {
      jest.mocked(prisma.wallet.findUnique).mockResolvedValue(null);
      jest.mocked(prisma.wallet.create).mockResolvedValue({
        ...mockWallet,
        balance: new Prisma.Decimal(0),
      });

      const result = await repository.getBalance('user-1');

      expect(result).toBe(0);
    });
  });
});
