import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionStatus, TransactionType } from '../enums';
import { PrismaService } from '../prisma/prisma.service';

type PrismaTransactionClient = Pick<PrismaService, 'transaction'>;

export interface TransactionByPeriodItem {
  date: string;
  recebido: number;
  enviado: number;
}

export interface TransactionEntity {
  id: string;
  type: TransactionType;
  amount: unknown;
  senderId: string | null;
  receiverId: string | null;
  status: TransactionStatus;
  createdAt: Date;
}

export interface TransactionEntityWithRelations extends TransactionEntity {
  sender: { email: string } | null;
  receiver: { email: string } | null;
}

/** Maps a raw Prisma transaction row to our typed domain entity */
function toEntity(row: {
  id: string;
  type: string;
  amount: unknown;
  senderId: string | null;
  receiverId: string | null;
  status: string;
  createdAt: Date;
}): TransactionEntity {
  return {
    id: row.id,
    type: row.type as TransactionType,
    amount: row.amount,
    senderId: row.senderId,
    receiverId: row.receiverId,
    status: row.status as TransactionStatus,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: {
      type: TransactionType;
      amount: number;
      senderId?: string;
      receiverId?: string;
      status?: TransactionStatus;
    },
    tx?: PrismaTransactionClient,
  ): Promise<TransactionEntity> {
    const client = tx ?? this.prisma;
    const row = await client.transaction.create({
      data: {
        type: data.type,
        amount: data.amount,
        senderId: data.senderId ?? null,
        receiverId: data.receiverId ?? null,
        status: data.status ?? TransactionStatus.COMPLETED,
      },
    });
    return toEntity(row);
  }

  /**
   * Updates transaction status from COMPLETED to REVERSED.
   * Pass tx when inside a Prisma transaction.
   * Throws P2025 when record not found (e.g. already reversed).
   */
  async updateToReversed(
    id: string,
    tx?: PrismaTransactionClient,
  ): Promise<TransactionEntity> {
    const client = tx ?? this.prisma;
    const row = await client.transaction.update({
      where: { id, status: TransactionStatus.COMPLETED },
      data: { status: TransactionStatus.REVERSED },
    });
    return toEntity(row);
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    const row = await this.prisma.transaction.findUnique({
      where: { id },
    });
    return row ? toEntity(row) : null;
  }

  async findByUser(userId: string): Promise<TransactionEntityWithRelations[]> {
    const list = await this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { email: true } },
        receiver: { select: { email: true } },
      },
    });
    return list.map((row) => ({
      ...toEntity(row),
      sender: row.sender,
      receiver: row.receiver,
    }));
  }

  async sumReceivedTransfersLast10Min(
    userId: string,
    tx?: Pick<PrismaService, 'transaction'>,
  ): Promise<number> {
    const client = tx ?? this.prisma;
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const result = await client.transaction.aggregate({
      where: {
        receiverId: userId,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        createdAt: { gte: tenMinAgo },
      },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  async findByUserAggregatedByDay(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionByPeriodItem[]> {
    const rows = await this.prisma.$queryRaw<
      { date: string; recebido: string | number; enviado: string | number }[]
    >(Prisma.sql`
      WITH date_series AS (
        SELECT generate_series(
          ${startDate}::date,
          ${endDate}::date,
          '1 day'::interval
        )::date AS date
      ),
      aggregated AS (
        SELECT
          created_at::date AS date,
          COALESCE(SUM(CASE WHEN receiver_id = ${userId} THEN amount ELSE 0 END), 0) AS recebido,
          COALESCE(SUM(CASE WHEN sender_id = ${userId} THEN amount ELSE 0 END), 0) AS enviado
        FROM transactions
        WHERE (sender_id = ${userId} OR receiver_id = ${userId})
          AND status = 'completed'
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        GROUP BY created_at::date
      )
      SELECT
        ds.date::text AS date,
        COALESCE(a.recebido, 0) AS recebido,
        COALESCE(a.enviado, 0) AS enviado
      FROM date_series ds
      LEFT JOIN aggregated a ON ds.date = a.date
      ORDER BY ds.date
    `);

    return rows.map((r) => ({
      date: r.date,
      recebido: Number(r.recebido),
      enviado: Number(r.enviado),
    }));
  }
}
