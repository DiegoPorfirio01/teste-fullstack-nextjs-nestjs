import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreditPurchaseEntity {
  id: string;
  userId: string;
  packageId: string;
  credits: number;
  amount: unknown;
  createdAt: Date;
}

@Injectable()
export class CreditPurchaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    packageId: string;
    credits: number;
    amount: number;
  }): Promise<CreditPurchaseEntity> {
    const purchase = await this.prisma.creditPurchase.create({
      data: {
        userId: data.userId,
        packageId: data.packageId,
        credits: data.credits,
        amount: data.amount,
      },
    });
    return purchase;
  }

  async findByUser(userId: string): Promise<CreditPurchaseEntity[]> {
    const list = await this.prisma.creditPurchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return list;
  }
}
