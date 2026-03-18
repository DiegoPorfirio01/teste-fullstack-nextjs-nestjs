import { Module } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  controllers: [WalletController],
  providers: [WalletRepository, WalletService],
  exports: [WalletService, WalletRepository],
})
export class WalletModule {}
