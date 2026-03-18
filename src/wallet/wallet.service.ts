import { Injectable } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
}

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async get(userId: string): Promise<Wallet> {
    const entity = await this.walletRepository.getOrCreate(userId);
    return {
      id: entity.id,
      userId: entity.userId,
      balance: Number(entity.balance),
    };
  }

  async addBalance(userId: string, amount: number): Promise<Wallet> {
    const entity = await this.walletRepository.addBalance(userId, amount);
    return {
      id: entity.id,
      userId: entity.userId,
      balance: Number(entity.balance),
    };
  }

  async hasBalance(userId: string, amount: number): Promise<boolean> {
    const balance = await this.walletRepository.getBalance(userId);
    return balance >= amount;
  }

  /**
   * Atomically subtracts amount from wallet. Uses single UPDATE with check in repository.
   * Throws BadRequestException if insufficient balance.
   */
  async subtractBalance(userId: string, amount: number): Promise<Wallet> {
    const entity = await this.walletRepository.subtractBalance(userId, amount);
    return {
      id: entity.id,
      userId: entity.userId,
      balance: Number(entity.balance),
    };
  }
}
