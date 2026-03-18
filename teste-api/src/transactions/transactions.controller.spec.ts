import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStatus, TransactionType } from '../enums';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

const mockUser = { userId: 'user-1', email: 'test@test.com', role: 'user' };

const mockTransaction = {
  id: 'tx-1',
  type: TransactionType.TRANSFER,
  amount: 50,
  direction: 'sent' as const,
  counterpartEmail: 'receiver@test.com',
  status: TransactionStatus.COMPLETED,
  createdAt: '2024-01-01T00:00:00.000Z',
  canReverse: false,
};

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: jest.Mocked<TransactionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
        {
          provide: TransactionsService,
          useValue: {
            deposit: jest.fn(),
            transfer: jest.fn(),
            list: jest.fn(),
            listByPeriod: jest.fn(),
            reverse: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deposit', () => {
    it('should call service.deposit with userId and amount', async () => {
      transactionsService.deposit.mockResolvedValue(mockTransaction);

      const result = await controller.deposit(mockUser, { amount: 100 });

      expect(result).toEqual(mockTransaction);
      expect(transactionsService.deposit).toHaveBeenCalledWith('user-1', 100);
    });
  });

  describe('transfer', () => {
    it('should call service.transfer with userId, receiverEmail and amount', async () => {
      transactionsService.transfer.mockResolvedValue(mockTransaction);

      const result = await controller.transfer(mockUser, {
        receiverEmail: 'receiver@test.com',
        amount: 50,
      });

      expect(result).toEqual(mockTransaction);
      expect(transactionsService.transfer).toHaveBeenCalledWith(
        'user-1',
        'receiver@test.com',
        50,
      );
    });
  });

  describe('list', () => {
    it('should return transactions for current user', async () => {
      transactionsService.list.mockResolvedValue([mockTransaction]);

      const result = await controller.list(mockUser);

      expect(result).toEqual([mockTransaction]);
      expect(transactionsService.list).toHaveBeenCalledWith('user-1');
    });
  });

  describe('listByPeriod', () => {
    it('should call service with userId and default 30 days when days invalid', async () => {
      const items = [{ date: '2024-01-01', recebido: 10, enviado: 5 }];
      transactionsService.listByPeriod.mockResolvedValue(items);

      const result = await controller.listByPeriod(mockUser, 'invalid');

      expect(result).toEqual(items);
      expect(transactionsService.listByPeriod).toHaveBeenCalledWith(
        'user-1',
        30,
      );
    });

    it('should call service with userId and valid days param', async () => {
      const items = [{ date: '2024-01-01', recebido: 10, enviado: 5 }];
      transactionsService.listByPeriod.mockResolvedValue(items);

      const result = await controller.listByPeriod(mockUser, '7');

      expect(result).toEqual(items);
      expect(transactionsService.listByPeriod).toHaveBeenCalledWith(
        'user-1',
        7,
      );
    });
  });

  describe('reverse', () => {
    it('should call service.reverse with userId and transaction id', async () => {
      const reversed = {
        ...mockTransaction,
        status: TransactionStatus.REVERSED,
      };
      transactionsService.reverse.mockResolvedValue(reversed);

      const result = await controller.reverse(mockUser, 'tx-1');

      expect(result).toEqual(reversed);
      expect(transactionsService.reverse).toHaveBeenCalledWith(
        'user-1',
        'tx-1',
      );
    });
  });
});
