import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../wallet/wallet.service';
import { CreditPurchaseRepository } from './credit-purchase.repository';
import { CreditsService } from './credits.service';

const mockCreditPurchaseEntity = {
  id: 'purchase-1',
  userId: 'user-1',
  packageId: '10',
  credits: 10,
  amount: 9.9,
  createdAt: new Date('2024-01-01'),
};

describe('CreditsService', () => {
  let service: CreditsService;
  let walletService: jest.Mocked<WalletService>;
  let creditPurchaseRepository: jest.Mocked<CreditPurchaseRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        {
          provide: WalletService,
          useValue: {
            addBalance: jest.fn(),
          },
        },
        {
          provide: CreditPurchaseRepository,
          useValue: {
            create: jest.fn(),
            findByUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreditsService>(CreditsService);
    walletService = module.get(WalletService);
    creditPurchaseRepository = module.get(CreditPurchaseRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buy', () => {
    it('should create purchase, add credits to wallet and return purchase', async () => {
      creditPurchaseRepository.create.mockResolvedValue(
        mockCreditPurchaseEntity,
      );

      const result = await service.buy('user-1', '10');

      expect(result).toEqual({
        id: 'purchase-1',
        userId: 'user-1',
        packageId: '10',
        credits: 10,
        amount: 9.9,
        createdAt: mockCreditPurchaseEntity.createdAt.toISOString(),
      });
      expect(creditPurchaseRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        packageId: '10',
        credits: 10,
        amount: 9.9,
      });
      expect(walletService.addBalance).toHaveBeenCalledWith('user-1', 10);
    });

    it('should handle package 50', async () => {
      const entity50 = {
        ...mockCreditPurchaseEntity,
        packageId: '50',
        credits: 50,
        amount: 44.9,
      };
      creditPurchaseRepository.create.mockResolvedValue(entity50);

      const result = await service.buy('user-1', '50');

      expect(result.credits).toBe(50);
      expect(result.amount).toBe(44.9);
      expect(creditPurchaseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ credits: 50, amount: 44.9 }),
      );
    });

    it('should handle package 100', async () => {
      const entity100 = {
        ...mockCreditPurchaseEntity,
        packageId: '100',
        credits: 100,
        amount: 79.9,
      };
      creditPurchaseRepository.create.mockResolvedValue(entity100);

      const result = await service.buy('user-1', '100');

      expect(result.credits).toBe(100);
      expect(result.amount).toBe(79.9);
    });

    it('should throw NotFoundException for invalid package', async () => {
      await expect(service.buy('user-1', 'invalid')).rejects.toThrow(
        NotFoundException,
      );
      expect(creditPurchaseRepository.create).not.toHaveBeenCalled();
      expect(walletService.addBalance).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return list of purchases', async () => {
      creditPurchaseRepository.findByUser.mockResolvedValue([
        mockCreditPurchaseEntity,
      ]);

      const result = await service.list('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'purchase-1',
        userId: 'user-1',
        packageId: '10',
        credits: 10,
        amount: 9.9,
        createdAt: mockCreditPurchaseEntity.createdAt.toISOString(),
      });
      expect(creditPurchaseRepository.findByUser).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });
});
