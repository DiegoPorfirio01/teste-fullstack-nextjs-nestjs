import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CacheKeyTransactionsByPeriod,
  CacheKeyTransactionsList,
  CacheTTLTransactionsByPeriod,
  CacheTTLTransactionsList,
  isValidPeriod,
} from '../cache';
import { CurrentUser } from '../guards/current-user.decorator';
import type { CurrentUserType } from '../guards';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';

@ApiTags('transactions')
@Controller({ path: 'transactions', version: '1' })
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Depositar dinheiro' })
  @ApiResponse({ status: 201, description: 'Depósito realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async deposit(@CurrentUser() user: CurrentUserType, @Body() dto: DepositDto) {
    return this.transactionsService.deposit(user.userId, dto.amount);
  }

  @Post('transfer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transferir dinheiro para outro usuário' })
  @ApiResponse({
    status: 201,
    description: 'Transferência realizada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async transfer(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: TransferDto,
  ) {
    return this.transactionsService.transfer(
      user.userId,
      dto.receiverEmail,
      dto.amount,
    );
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar transações' })
  @ApiResponse({ status: 200, description: 'Lista de transações' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @UseInterceptors(CacheInterceptor)
  @CacheKeyTransactionsList
  @CacheTTLTransactionsList
  async list(@CurrentUser() user: CurrentUserType) {
    return this.transactionsService.list(user.userId);
  }

  @Get('by-period')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transações agregadas por período (para gráfico)' })
  @ApiResponse({ status: 200, description: 'Dados agregados por data' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @UseInterceptors(CacheInterceptor)
  @CacheKeyTransactionsByPeriod
  @CacheTTLTransactionsByPeriod
  async listByPeriod(
    @CurrentUser() user: CurrentUserType,
    @Query('days') days?: string,
  ) {
    const daysNum = Number(days);
    const valid = isValidPeriod(daysNum) ? daysNum : 30;
    return this.transactionsService.listByPeriod(user.userId, valid);
  }

  @Post(':id/reverse')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estornar transferência' })
  @ApiResponse({ status: 200, description: 'Transação estornada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  async reverse(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.transactionsService.reverse(user.userId, id);
  }
}
