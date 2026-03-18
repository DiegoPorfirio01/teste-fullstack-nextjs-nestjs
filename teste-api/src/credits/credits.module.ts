import { Module } from '@nestjs/common';
import { WalletModule } from '../wallet/wallet.module';
import { CreditPurchaseRepository } from './credit-purchase.repository';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  imports: [WalletModule],
  controllers: [CreditsController],
  providers: [CreditPurchaseRepository, CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
