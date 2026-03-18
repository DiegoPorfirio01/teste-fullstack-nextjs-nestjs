import { BadRequestException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { WalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

const mockWalletEntity = {
  id: 'wallet-1',
  userId: 'user-1',
  balance: 100,
};

describe('WalletService', () => {
  let service: WalletService;
  let repository: jest.Mocked<WalletRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: WalletRepository,
          useValue: {
            getOrCreate: jest.fn(),
            addBalance: jest.fn(),
            getBalance: jest.fn(),
            subtractBalance: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    repository = module.get(WalletRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return wallet when exists', async () => {
      repository.getOrCreate.mockResolvedValue(mockWalletEntity);

      const result = await service.get('user-1');

      expect(result).toEqual({
        id: 'wallet-1',
        userId: 'user-1',
        balance: 100,
      });
      expect(repository.getOrCreate).toHaveBeenCalledWith('user-1');
    });
  });

  describe('addBalance', () => {
    it('should add balance and return updated wallet', async () => {
      const updatedEntity = { ...mockWalletEntity, balance: 150 };
      repository.addBalance.mockResolvedValue(updatedEntity);

      const result = await service.addBalance('user-1', 50);

      expect(result).toEqual({
        id: 'wallet-1',
        userId: 'user-1',
        balance: 150,
      });
      expect(repository.addBalance).toHaveBeenCalledWith('user-1', 50);
    });
  });

  describe('hasBalance', () => {
    it('should return true when balance is sufficient', async () => {
      repository.getBalance.mockResolvedValue(100);

      const result = await service.hasBalance('user-1', 50);

      expect(result).toBe(true);
    });

    it('should return false when balance is insufficient', async () => {
      repository.getBalance.mockResolvedValue(30);

      const result = await service.hasBalance('user-1', 50);

      expect(result).toBe(false);
    });
  });

  describe('subtractBalance', () => {
    it('should subtract and return updated wallet', async () => {
      const updatedEntity = { ...mockWalletEntity, balance: 50 };
      repository.subtractBalance.mockResolvedValue(updatedEntity);

      const result = await service.subtractBalance('user-1', 50);

      expect(result).toEqual({
        id: 'wallet-1',
        userId: 'user-1',
        balance: 50,
      });
    });

    it('should propagate BadRequestException when insufficient balance', async () => {
      repository.subtractBalance.mockRejectedValue(
        new BadRequestException('Saldo insuficiente'),
      );

      await expect(service.subtractBalance('user-1', 200)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
