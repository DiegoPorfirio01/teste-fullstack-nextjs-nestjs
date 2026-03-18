import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreditPurchaseRepository } from './credit-purchase.repository';

const mockPurchase = {
  id: 'purchase-1',
  userId: 'user-1',
  packageId: '10',
  credits: 10,
  amount: new Prisma.Decimal(9.9),
  createdAt: new Date('2024-01-01'),
};

describe('CreditPurchaseRepository', () => {
  let repository: CreditPurchaseRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock = {
      creditPurchase: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditPurchaseRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<CreditPurchaseRepository>(CreditPurchaseRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create purchase and return entity', async () => {
      jest.mocked(prisma.creditPurchase.create).mockResolvedValue(mockPurchase);

      const result = await repository.create({
        userId: 'user-1',
        packageId: '10',
        credits: 10,
        amount: 9.9,
      });

      expect(result).toEqual(mockPurchase);
      expect(prisma.creditPurchase.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          packageId: '10',
          credits: 10,
          amount: 9.9,
        },
      });
    });
  });

  describe('findByUser', () => {
    it('should return purchases ordered by createdAt desc', async () => {
      jest
        .mocked(prisma.creditPurchase.findMany)
        .mockResolvedValue([mockPurchase]);

      const result = await repository.findByUser('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPurchase);
      expect(prisma.creditPurchase.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no purchases', async () => {
      jest.mocked(prisma.creditPurchase.findMany).mockResolvedValue([]);

      const result = await repository.findByUser('user-1');

      expect(result).toEqual([]);
    });
  });
});
