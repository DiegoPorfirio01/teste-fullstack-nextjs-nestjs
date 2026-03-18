import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../guards/current-user.decorator';
import type { CurrentUserType } from '../guards';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller({ path: 'wallet', version: '1' })
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter saldo da carteira' })
  @ApiResponse({ status: 200, description: 'Retorna a carteira' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async get(@CurrentUser() user: CurrentUserType) {
    return this.walletService.get(user.userId);
  }
}
