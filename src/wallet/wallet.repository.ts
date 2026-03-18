import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type PrismaWalletClient = Pick<PrismaService, 'wallet'>;
/** Client with raw SQL support for use inside $transaction */
type PrismaClientWithRaw = Pick<
  PrismaService,
  'wallet' | '$queryRaw' | '$executeRaw'
>;

export interface WalletEntity {
  id: string;
  userId: string;
  balance: unknown;
}

@Injectable()
export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<WalletEntity | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    return wallet;
  }

  async create(userId: string, balance = 0): Promise<WalletEntity> {
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        balance,
      },
    });
    return wallet;
  }

  async getOrCreate(
    userId: string,
    tx?: PrismaWalletClient,
  ): Promise<WalletEntity> {
    const client = tx ?? this.prisma;
    let wallet = await client.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await client.wallet.create({
        data: { userId, balance: 0 },
      });
    }
    return wallet;
  }

  async addBalance(userId: string, amount: number): Promise<WalletEntity> {
    await this.getOrCreate(userId);
    const updated = await this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: { increment: amount },
      },
    });
    return updated;
  }

  /**
   * Atomically subtracts amount from wallet balance. Uses a single UPDATE with check:
   * UPDATE wallets SET balance = balance - amount WHERE user_id = X AND balance >= amount.
   * Throws BadRequestException if 0 rows affected (insufficient balance or no wallet).
   * Pass tx when inside a Prisma transaction.
   */
  async subtractBalance(
    userId: string,
    amount: number,
    tx?: PrismaClientWithRaw,
  ): Promise<WalletEntity> {
    const client: PrismaClientWithRaw = tx ?? this.prisma;
    const rows = await client.$queryRaw<
      Array<{ id: string; user_id: string; balance: unknown }>
    >`
      UPDATE wallets
      SET balance = balance - ${amount}
      WHERE user_id = ${userId}
        AND balance >= ${amount}
      RETURNING id, user_id, balance
    `;
    if (rows.length === 0) {
      throw new BadRequestException('Saldo insuficiente');
    }
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      balance: row.balance,
    };
  }

  /**
   * Increments wallet balance by amount. Pass tx when inside a Prisma transaction.
   */
  async incrementBalance(
    userId: string,
    amount: number,
    tx?: PrismaWalletClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreate(userId);
    return Number(wallet.balance);
  }
}
