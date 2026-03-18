import { Injectable, NotFoundException } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { CreditPurchaseRepository } from './credit-purchase.repository';
import { CREDIT_PACKAGES } from './credits.config';

export interface CreditPurchase {
  id: string;
  userId: string;
  packageId: string;
  credits: number;
  amount: number;
  createdAt: string;
}

@Injectable()
export class CreditsService {
  constructor(
    private readonly walletService: WalletService,
    private readonly creditPurchaseRepository: CreditPurchaseRepository,
  ) {}

  private mapToCreditPurchase(entity: {
    id: string;
    userId: string;
    packageId: string;
    credits: number;
    amount: unknown;
    createdAt: Date;
  }): CreditPurchase {
    return {
      id: entity.id,
      userId: entity.userId,
      packageId: entity.packageId,
      credits: entity.credits,
      amount: Number(entity.amount),
      createdAt: entity.createdAt.toISOString(),
    };
  }

  async buy(userId: string, packageId: string): Promise<CreditPurchase> {
    const pkg = CREDIT_PACKAGES[packageId];
    const credits = pkg?.credits;
    const amount = pkg?.amount;

    if (!credits || amount == null) {
      throw new NotFoundException(`Pacote inválido: ${packageId}`);
    }

    const entity = await this.creditPurchaseRepository.create({
      userId,
      packageId,
      credits,
      amount,
    });

    await this.walletService.addBalance(userId, credits);

    return this.mapToCreditPurchase(entity);
  }

  async list(userId: string): Promise<CreditPurchase[]> {
    const entities = await this.creditPurchaseRepository.findByUser(userId);
    return entities.map((e) => this.mapToCreditPurchase(e));
  }
}
