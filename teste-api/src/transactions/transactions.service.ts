import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_KEYS, CACHE_PERIOD_DAYS } from '../cache/cache.constants';
import {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '../enums';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { WalletRepository } from '../wallet/wallet.repository';
import { WalletService } from '../wallet/wallet.service';
import {
  TransactionByPeriodItem,
  TransactionEntity,
  TransactionEntityWithRelations,
  TransactionRepository,
} from './transaction.repository';

export type {
  TransactionByPeriodItem,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
};

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  senderId?: string;
  receiverId?: string;
  status: TransactionStatus;
  createdAt: string;
  direction: TransactionDirection;
  canReverse: boolean;
  counterpartEmail?: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly walletRepository: WalletRepository,
    private readonly usersService: UsersService,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  private async invalidateUserCaches(userId: string): Promise<void> {
    await Promise.all([
      this.cache.del(CACHE_KEYS.TRANSACTIONS_LIST(userId)),
      ...CACHE_PERIOD_DAYS.map((d) =>
        this.cache.del(CACHE_KEYS.TRANSACTIONS_BY_PERIOD(userId, d)),
      ),
    ]);
  }

  private mapToTransaction(
    entity: TransactionEntityWithRelations,
    userId: string,
  ): Transaction {
    const isSent = entity.senderId === userId;
    const direction: TransactionDirection = isSent
      ? TransactionDirection.SENT
      : TransactionDirection.RECEIVED;
    const elapsed = Date.now() - new Date(entity.createdAt).getTime();
    const withinRevertWindow = elapsed <= TransactionsService.REVERT_WINDOW_MS;
    const canReverse =
      entity.type === TransactionType.TRANSFER &&
      entity.status === TransactionStatus.COMPLETED &&
      isSent &&
      withinRevertWindow;
    const counterpartEmail = isSent
      ? entity.receiver?.email
      : entity.sender?.email;

    return {
      id: entity.id,
      type: entity.type,
      amount: Number(entity.amount),
      senderId: entity.senderId ?? undefined,
      receiverId: entity.receiverId ?? undefined,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      direction,
      canReverse,
      counterpartEmail,
    };
  }

  async deposit(userId: string, amount: number): Promise<Transaction> {
    if (amount <= 0) {
      throw new BadRequestException('O valor deve ser positivo');
    }
    await this.walletService.addBalance(userId, amount);
    const entity = await this.transactionRepository.create({
      type: TransactionType.DEPOSIT,
      amount,
      receiverId: userId,
      status: TransactionStatus.COMPLETED,
    });
    await this.invalidateUserCaches(userId);
    return this.mapToTransaction(
      { ...entity, sender: null, receiver: null },
      userId,
    );
  }

  private async validateTransferInput(
    senderId: string,
    receiverEmail: string,
    amount: number,
  ): Promise<{ receiverId: string; receiver: { id: string; email: string } }> {
    if (amount <= 0) {
      throw new BadRequestException('O valor deve ser positivo');
    }
    const receiver = await this.usersService.findByEmail(receiverEmail);
    if (!receiver) {
      throw new NotFoundException('Destinatário não encontrado');
    }
    if (senderId === receiver.id) {
      throw new BadRequestException('Não é possível transferir para si mesmo');
    }
    return { receiverId: receiver.id, receiver };
  }

  private async validateTransferBalance(
    senderId: string,
    amount: number,
    senderWallet: { balance: unknown },
    tx: Pick<PrismaService, 'wallet' | 'transaction'>,
  ): Promise<void> {
    const lockedAmount =
      await this.transactionRepository.sumReceivedTransfersLast10Min(
        senderId,
        tx,
      );
    const senderBalance = Number(senderWallet.balance);
    const availableToTransfer = senderBalance - lockedAmount;
    if (senderBalance < amount) {
      throw new BadRequestException('Saldo insuficiente');
    }
    if (amount > availableToTransfer) {
      throw new BadRequestException(
        'Valores recebidos só podem ser transferidos após 10 minutos',
      );
    }
  }

  private async ensureWalletsForTransfer(
    senderId: string,
    receiverId: string,
    tx: Pick<PrismaService, 'wallet'>,
  ): Promise<{
    senderWallet: { balance: unknown };
    receiverWallet: { balance: unknown };
  }> {
    const senderWallet = await this.walletRepository.getOrCreate(senderId, tx);
    const receiverWallet = await this.walletRepository.getOrCreate(
      receiverId,
      tx,
    );
    return { senderWallet, receiverWallet };
  }

  private debitSender(
    senderId: string,
    amount: number,
    tx: Parameters<WalletRepository['subtractBalance']>[2],
  ): ReturnType<WalletRepository['subtractBalance']> {
    return this.walletRepository.subtractBalance(senderId, amount, tx);
  }

  private creditReceiver(
    receiverId: string,
    amount: number,
    tx: Parameters<WalletRepository['incrementBalance']>[2],
  ): Promise<void> {
    return this.walletRepository.incrementBalance(receiverId, amount, tx);
  }

  private createTransferRecord(
    data: {
      type: typeof TransactionType.TRANSFER;
      amount: number;
      senderId: string;
      receiverId: string;
      status: typeof TransactionStatus.COMPLETED;
    },
    tx: Parameters<TransactionRepository['create']>[1],
  ): ReturnType<TransactionRepository['create']> {
    return this.transactionRepository.create(
      {
        type: TransactionType.TRANSFER,
        amount: data.amount,
        senderId: data.senderId,
        receiverId: data.receiverId,
        status: TransactionStatus.COMPLETED,
      },
      tx,
    );
  }

  async transfer(
    senderId: string,
    receiverEmail: string,
    amount: number,
  ): Promise<Transaction> {
    const { receiverId, receiver } = await this.validateTransferInput(
      senderId,
      receiverEmail,
      amount,
    );

    const entity = await this.prisma.$transaction(async (tx) => {
      const { senderWallet } = await this.ensureWalletsForTransfer(
        senderId,
        receiverId,
        tx,
      );
      await this.validateTransferBalance(senderId, amount, senderWallet, tx);
      await this.debitSender(senderId, amount, tx);
      await this.creditReceiver(receiverId, amount, tx);
      return this.createTransferRecord(
        {
          type: TransactionType.TRANSFER,
          amount,
          senderId,
          receiverId,
          status: TransactionStatus.COMPLETED,
        },
        tx,
      );
    });

    await Promise.all([
      this.invalidateUserCaches(senderId),
      this.invalidateUserCaches(receiverId),
    ]);
    return this.mapToTransaction(
      {
        ...entity,
        sender: null,
        receiver: { email: receiver.email },
      },
      senderId,
    );
  }

  async list(userId: string): Promise<Transaction[]> {
    const entities = await this.transactionRepository.findByUser(userId);
    return entities.map((e) => this.mapToTransaction(e, userId));
  }

  async listByPeriod(
    userId: string,
    days: 7 | 30 | 90,
  ): Promise<TransactionByPeriodItem[]> {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    return this.transactionRepository.findByUserAggregatedByDay(
      userId,
      start,
      now,
    );
  }

  private static readonly REVERT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

  private async ensureWalletsForReverse(
    senderId: string,
    receiverId: string,
    tx: Pick<PrismaService, 'wallet'>,
  ): Promise<void> {
    await this.walletRepository.getOrCreate(senderId, tx);
    await this.walletRepository.getOrCreate(receiverId, tx);
  }

  private debitReceiver(
    receiverId: string,
    amount: number,
    tx: Parameters<WalletRepository['subtractBalance']>[2],
  ): ReturnType<WalletRepository['subtractBalance']> {
    return this.walletRepository.subtractBalance(receiverId, amount, tx);
  }

  private creditSender(
    senderId: string,
    amount: number,
    tx: Parameters<WalletRepository['incrementBalance']>[2],
  ): Promise<void> {
    return this.walletRepository.incrementBalance(senderId, amount, tx);
  }

  private markTransactionReversed(
    transactionId: string,
    tx: Parameters<TransactionRepository['updateToReversed']>[1],
  ): ReturnType<TransactionRepository['updateToReversed']> {
    return this.transactionRepository.updateToReversed(transactionId, tx);
  }

  private validateReverseInput(
    userId: string,
    entity: TransactionEntity | null,
  ): { amount: number; receiverId: string } {
    if (!entity) {
      throw new NotFoundException('Transação não encontrada');
    }
    if (entity.status === TransactionStatus.REVERSED) {
      throw new BadRequestException('Transação já estornada');
    }
    if (
      entity.type !== TransactionType.TRANSFER ||
      entity.senderId !== userId
    ) {
      throw new BadRequestException(
        'Apenas o remetente pode estornar a transferência',
      );
    }
    const elapsed = Date.now() - new Date(entity.createdAt).getTime();
    if (elapsed > TransactionsService.REVERT_WINDOW_MS) {
      throw new BadRequestException(
        'Estorno permitido apenas dentro de 10 minutos da transferência',
      );
    }
    const receiverId = entity.receiverId;
    if (!receiverId) {
      throw new BadRequestException('Transação inválida: destinatário ausente');
    }
    return { amount: Number(entity.amount), receiverId };
  }

  async reverse(userId: string, transactionId: string): Promise<Transaction> {
    const entity = await this.transactionRepository.findById(transactionId);
    const { amount, receiverId } = this.validateReverseInput(userId, entity);

    let updated: TransactionEntity;
    try {
      updated = await this.prisma.$transaction(async (tx) => {
        await this.ensureWalletsForReverse(userId, receiverId, tx);
        await this.debitReceiver(receiverId, amount, tx);
        await this.creditSender(userId, amount, tx);
        return this.markTransactionReversed(transactionId, tx);
      });
    } catch (e: unknown) {
      if (isPrismaError(e) && e.code === 'P2025') {
        throw new BadRequestException('Transação já estornada');
      }
      throw e;
    }

    await Promise.all([
      this.invalidateUserCaches(userId),
      this.invalidateUserCaches(receiverId),
    ]);
    return this.mapToTransaction(
      { ...updated, sender: null, receiver: null },
      userId,
    );
  }
}

function isPrismaError(e: unknown): e is { code: string } {
  return e !== null && typeof e === 'object' && 'code' in e;
}
