import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { TransactionStatus, TransactionType } from '../enums';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionRepository } from './transaction.repository';

const mockTransaction = {
  id: 'tx-1',
  type: TransactionType.TRANSFER,
  amount: new Prisma.Decimal(50),
  senderId: 'user-1',
  receiverId: 'user-2',
  status: TransactionStatus.COMPLETED,
  createdAt: new Date('2024-01-01'),
};

const mockTransactionWithRelations = {
  ...mockTransaction,
  sender: { email: 'sender@test.com' },
  receiver: { email: 'receiver@test.com' },
};

describe('TransactionRepository', () => {
  let repository: TransactionRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock = {
      transaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create transaction with default status', async () => {
      jest.mocked(prisma.transaction.create).mockResolvedValue(mockTransaction);

      const result = await repository.create({
        type: TransactionType.DEPOSIT,
        amount: 100,
        receiverId: 'user-1',
      });

      expect(result).toEqual(mockTransaction);
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          type: TransactionType.DEPOSIT,
          amount: 100,
          senderId: null,
          receiverId: 'user-1',
          status: TransactionStatus.COMPLETED,
        },
      });
    });

    it('should create transaction with explicit status', async () => {
      jest.mocked(prisma.transaction.create).mockResolvedValue(mockTransaction);

      await repository.create({
        type: TransactionType.TRANSFER,
        amount: 50,
        senderId: 'user-1',
        receiverId: 'user-2',
        status: TransactionStatus.COMPLETED,
      });

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          type: TransactionType.TRANSFER,
          amount: 50,
          senderId: 'user-1',
          receiverId: 'user-2',
          status: TransactionStatus.COMPLETED,
        },
      });
    });
  });

  describe('findById', () => {
    it('should return transaction when found', async () => {
      jest
        .mocked(prisma.transaction.findUnique)
        .mockResolvedValue(mockTransaction);

      const result = await repository.findById('tx-1');

      expect(result).toEqual(mockTransaction);
      expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
    });

    it('should return null when not found', async () => {
      jest.mocked(prisma.transaction.findUnique).mockResolvedValue(null);

      const result = await repository.findById('unknown');

      expect(result).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should return transactions for user with relations', async () => {
      jest
        .mocked(prisma.transaction.findMany)
        .mockResolvedValue([mockTransactionWithRelations]);

      const result = await repository.findByUser('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTransactionWithRelations);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ senderId: 'user-1' }, { receiverId: 'user-1' }],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { email: true } },
          receiver: { select: { email: true } },
        },
      });
    });
  });

  describe('sumReceivedTransfersLast10Min', () => {
    it('should return sum of received transfers in last 10 min', async () => {
      jest.mocked(prisma.transaction.aggregate).mockResolvedValue({
        _count: { id: 0 },
        _sum: { amount: new Prisma.Decimal(150) },
        _avg: { amount: null },
        _min: { amount: null },
        _max: { amount: null },
      });

      const result = await repository.sumReceivedTransfersLast10Min('user-1');

      expect(result).toBe(150);
      expect(prisma.transaction.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            receiverId: 'user-1',
            type: TransactionType.TRANSFER,
            status: TransactionStatus.COMPLETED,
            createdAt: expect.objectContaining({ gte: expect.any(Date) }),
          }),
          _sum: { amount: true },
        }),
      );
    });

    it('should return 0 when no transfers', async () => {
      jest.mocked(prisma.transaction.aggregate).mockResolvedValue({
        _count: { id: 0 },
        _sum: { amount: null },
        _avg: { amount: null },
        _min: { amount: null },
        _max: { amount: null },
      });

      const result = await repository.sumReceivedTransfersLast10Min('user-1');

      expect(result).toBe(0);
    });
  });

  describe('findByUserAggregatedByDay', () => {
    it('should return aggregated data by day', async () => {
      const rows = [
        { date: '2024-01-01', recebido: '10', enviado: '5' },
        { date: '2024-01-02', recebido: 0, enviado: 0 },
      ];
      jest.mocked(prisma.$queryRaw).mockResolvedValue(rows);

      const start = new Date('2024-01-01');
      const end = new Date('2024-01-02');
      const result = await repository.findByUserAggregatedByDay(
        'user-1',
        start,
        end,
      );

      expect(result).toEqual([
        { date: '2024-01-01', recebido: 10, enviado: 5 },
        { date: '2024-01-02', recebido: 0, enviado: 0 },
      ]);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
