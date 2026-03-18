import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import type { Cache } from 'cache-manager';
import { TransactionStatus, TransactionType } from '../enums';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';
import { WalletRepository } from '../wallet/wallet.repository';
import { TransactionRepository } from './transaction.repository';
import { TransactionsService } from './transactions.service';

/** Cria data relativa a "agora" para testar janela de 10 min */
const minsAgo = (mins: number) => new Date(Date.now() - mins * 60 * 1000);

const mockTransactionEntity = {
  id: 'tx-1',
  type: TransactionType.TRANSFER,
  amount: 50,
  senderId: 'user-1',
  receiverId: 'user-2',
  status: TransactionStatus.COMPLETED,
  createdAt: minsAgo(5),
  sender: null,
  receiver: { email: 'receiver@test.com' },
};

const mockReceiver = {
  id: 'user-2',
  email: 'receiver@test.com',
  name: 'Receiver',
  passwordHash: 'hash',
  role: 'user',
  status: 'active',
  createdAt: '2024-01-01',
};

const mockSenderWallet = { id: 'w-1', userId: 'user-1', balance: 100 };
const mockReceiverWallet = { id: 'w-2', userId: 'user-2', balance: 0 };

describe('TransactionsService', () => {
  let service: TransactionsService;
  let walletService: jest.Mocked<WalletService>;
  let walletRepository: jest.Mocked<WalletRepository>;
  let usersService: jest.Mocked<UsersService>;
  let transactionRepository: jest.Mocked<TransactionRepository>;

  const mockTx = {
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      aggregate: jest.fn(),
      update: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };

  const mockCreatedTransferEntity = {
    id: 'tx-new',
    type: TransactionType.TRANSFER,
    amount: 50,
    senderId: 'user-1',
    receiverId: 'user-2',
    status: TransactionStatus.COMPLETED,
    createdAt: new Date(),
  };

  /** Configura mocks para $transaction da transferência */
  function setupTransferMocks(
    opts: {
      senderBalance?: number;
      lockedAmount?: number;
      executeRawRows?: number;
    } = {},
  ) {
    const { senderBalance = 100, lockedAmount = 0, executeRawRows = 1 } = opts;
    walletRepository.getOrCreate
      .mockResolvedValueOnce({ ...mockSenderWallet, balance: senderBalance })
      .mockResolvedValueOnce(mockReceiverWallet);
    transactionRepository.sumReceivedTransfersLast10Min.mockResolvedValue(
      lockedAmount,
    );
    if (executeRawRows === 0) {
      walletRepository.subtractBalance.mockRejectedValue(
        new BadRequestException('Saldo insuficiente'),
      );
    } else {
      walletRepository.subtractBalance.mockResolvedValue(mockSenderWallet);
      walletRepository.incrementBalance.mockResolvedValue(undefined);
    }
    transactionRepository.create.mockResolvedValue(mockCreatedTransferEntity);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            del: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(
              (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
            ),
            wallet: mockTx.wallet,
            transaction: mockTx.transaction,
          },
        },
        {
          provide: WalletService,
          useValue: {
            addBalance: jest.fn(),
          },
        },
        {
          provide: WalletRepository,
          useValue: {
            getOrCreate: jest.fn(),
            subtractBalance: jest.fn(),
            incrementBalance: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: TransactionRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByUser: jest.fn(),
            findByUserAggregatedByDay: jest.fn(),
            sumReceivedTransfersLast10Min: jest.fn(),
            updateToReversed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    walletService = module.get(WalletService);
    walletRepository = module.get(WalletRepository);
    usersService = module.get(UsersService);
    transactionRepository = module.get(TransactionRepository);

    jest.clearAllMocks();
  });

  describe('deposit', () => {
    it('should add balance, create transaction and return mapped transaction', async () => {
      walletService.addBalance.mockResolvedValue({
        id: 'w-1',
        userId: 'user-1',
        balance: 100,
      });
      const createdEntity = {
        id: 'tx-dep',
        type: TransactionType.DEPOSIT,
        amount: 50,
        senderId: null,
        receiverId: 'user-1',
        status: TransactionStatus.COMPLETED,
        createdAt: new Date(),
      };
      transactionRepository.create.mockResolvedValue(createdEntity);

      const result = await service.deposit('user-1', 50);

      expect(result.id).toBe('tx-dep');
      expect(result.type).toBe(TransactionType.DEPOSIT);
      expect(result.amount).toBe(50);
      expect(result.direction).toBe('received');
      expect(walletService.addBalance).toHaveBeenCalledWith('user-1', 50);
      expect(transactionRepository.create).toHaveBeenCalledWith({
        type: TransactionType.DEPOSIT,
        amount: 50,
        receiverId: 'user-1',
        status: TransactionStatus.COMPLETED,
      });
    });

    it('should throw BadRequestException when amount <= 0', async () => {
      await expect(service.deposit('user-1', 0)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.deposit('user-1', -10)).rejects.toThrow(
        BadRequestException,
      );
      expect(walletService.addBalance).not.toHaveBeenCalled();
    });
  });

  describe('transfer', () => {
    it('should throw BadRequestException when amount <= 0', async () => {
      await expect(service.transfer('user-1', 'r@t.com', 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when receiver not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.transfer('user-1', 'unknown@test.com', 50),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when transferring to self', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'self@test.com',
      } as never);

      await expect(
        service.transfer('user-1', 'self@test.com', 50),
      ).rejects.toThrow(BadRequestException);
    });

    it('should complete transfer when no locked amount (values received > 10 min ago)', async () => {
      usersService.findByEmail.mockResolvedValue(mockReceiver as never);
      setupTransferMocks({ senderBalance: 100, lockedAmount: 0 });

      const result = await service.transfer('user-1', 'receiver@test.com', 50);

      expect(result.id).toBe('tx-new');
      expect(result.type).toBe(TransactionType.TRANSFER);
      expect(result.amount).toBe(50);
      expect(result.direction).toBe('sent');
      expect(
        transactionRepository.sumReceivedTransfersLast10Min,
      ).toHaveBeenCalledWith('user-1', mockTx);
    });

    it('should throw when trying to transfer amount received in last 10 minutes (locked)', async () => {
      usersService.findByEmail.mockResolvedValue(mockReceiver as never);
      // user-1 has 100 but received 80 in last 10 min → available = 20, cannot transfer 50
      setupTransferMocks({ senderBalance: 100, lockedAmount: 80 });

      const err = await service
        .transfer('user-1', 'receiver@test.com', 50)
        .catch((e) => e);

      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toContain('10 minutos');
    });

    it('should throw when sender balance is insufficient', async () => {
      usersService.findByEmail.mockResolvedValue(mockReceiver as never);
      setupTransferMocks({ senderBalance: 30, lockedAmount: 0 });

      await expect(
        service.transfer('user-1', 'receiver@test.com', 50),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when raw update affects 0 rows (concurrent/race)', async () => {
      usersService.findByEmail.mockResolvedValue(mockReceiver as never);
      setupTransferMocks({
        senderBalance: 100,
        lockedAmount: 0,
        executeRawRows: 0,
      });

      await expect(
        service.transfer('user-1', 'receiver@test.com', 50),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('list', () => {
    it('should return mapped transactions with canReverse=true when within 10 min window', async () => {
      const txWithinWindow = {
        ...mockTransactionEntity,
        createdAt: minsAgo(5),
      };
      transactionRepository.findByUser.mockResolvedValue([txWithinWindow]);

      const result = await service.list('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].direction).toBe('sent');
      expect(result[0].canReverse).toBe(true);
      expect(result[0].counterpartEmail).toBe('receiver@test.com');
    });

    it('should return canReverse=false when outside 10 min window', async () => {
      const txOutsideWindow = {
        ...mockTransactionEntity,
        createdAt: minsAgo(11),
      };
      transactionRepository.findByUser.mockResolvedValue([txOutsideWindow]);

      const result = await service.list('user-1');

      expect(result[0].canReverse).toBe(false);
    });

    it('should return canReverse=false for deposit (not transfer)', async () => {
      const depositTx = {
        ...mockTransactionEntity,
        type: TransactionType.DEPOSIT,
        senderId: null,
        receiverId: 'user-1',
      };
      transactionRepository.findByUser.mockResolvedValue([depositTx]);

      const result = await service.list('user-1');

      expect(result[0].canReverse).toBe(false);
    });
  });

  describe('listByPeriod', () => {
    it('should delegate to repository with correct date range', async () => {
      const items = [{ date: '2024-01-01', recebido: 10, enviado: 5 }];
      transactionRepository.findByUserAggregatedByDay.mockResolvedValue(items);

      const result = await service.listByPeriod('user-1', 7);

      expect(result).toEqual(items);
      expect(
        transactionRepository.findByUserAggregatedByDay,
      ).toHaveBeenCalled();
    });
  });

  describe('reverse', () => {
    function setupReverseMocks(opts: { executeRawRows?: number } = {}) {
      const { executeRawRows = 1 } = opts;
      walletRepository.getOrCreate
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(mockReceiverWallet);
      if (executeRawRows === 0) {
        walletRepository.subtractBalance.mockRejectedValue(
          new BadRequestException('Saldo insuficiente'),
        );
      } else {
        walletRepository.subtractBalance.mockResolvedValue(mockReceiverWallet);
        walletRepository.incrementBalance.mockResolvedValue(undefined);
      }
      transactionRepository.updateToReversed.mockResolvedValue({
        id: 'tx-1',
        type: TransactionType.TRANSFER,
        amount: 50,
        senderId: 'user-1',
        receiverId: 'user-2',
        status: TransactionStatus.REVERSED,
        createdAt: minsAgo(5),
      });
    }

    it('should throw NotFoundException when transaction not found', async () => {
      transactionRepository.findById.mockResolvedValue(null);

      await expect(service.reverse('user-1', 'unknown-tx')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when already reversed', async () => {
      transactionRepository.findById.mockResolvedValue({
        ...mockTransactionEntity,
        status: TransactionStatus.REVERSED,
      });

      await expect(service.reverse('user-1', 'tx-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when not transfer type', async () => {
      transactionRepository.findById.mockResolvedValue({
        ...mockTransactionEntity,
        type: TransactionType.DEPOSIT,
      });

      await expect(service.reverse('user-1', 'tx-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when not sender', async () => {
      transactionRepository.findById.mockResolvedValue({
        ...mockTransactionEntity,
        senderId: 'user-2',
        receiverId: 'user-1',
      });

      await expect(service.reverse('user-1', 'tx-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when outside revert window (> 10 min)', async () => {
      const oldTx = {
        ...mockTransactionEntity,
        createdAt: minsAgo(15),
      };
      transactionRepository.findById.mockResolvedValue(oldTx);

      const err = await service.reverse('user-1', 'tx-1').catch((e) => e);

      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toContain('10 minutos');
    });

    it('should succeed when within 10 min revert window', async () => {
      const txWithinWindow = {
        ...mockTransactionEntity,
        createdAt: minsAgo(5),
      };
      transactionRepository.findById.mockResolvedValue(txWithinWindow);
      setupReverseMocks();

      const result = await service.reverse('user-1', 'tx-1');

      expect(result.id).toBe('tx-1');
      expect(result.status).toBe(TransactionStatus.REVERSED);
      expect(result.type).toBe(TransactionType.TRANSFER);
      expect(transactionRepository.updateToReversed).toHaveBeenCalledWith(
        'tx-1',
        mockTx,
      );
    });

    it('should throw when receiver has insufficient balance to reverse', async () => {
      transactionRepository.findById.mockResolvedValue({
        ...mockTransactionEntity,
        createdAt: minsAgo(5),
      });
      setupReverseMocks({ executeRawRows: 0 });

      const err = await service.reverse('user-1', 'tx-1').catch((e) => e);

      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message.toLowerCase()).toContain('saldo insuficiente');
    });

    it('should throw when receiverId is null (invalid transaction)', async () => {
      transactionRepository.findById.mockResolvedValue({
        ...mockTransactionEntity,
        receiverId: null,
      });

      await expect(service.reverse('user-1', 'tx-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
