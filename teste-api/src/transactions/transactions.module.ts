import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionRepository } from './transaction.repository';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [PrismaModule, WalletModule, UsersModule],
  controllers: [TransactionsController],
  providers: [TransactionRepository, TransactionsService],
})
export class TransactionsModule {}
