import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../guards/current-user.decorator';
import type { CurrentUserType } from '../guards';
import { CreditsService } from './credits.service';
import { BuyCreditsDto } from './dto/buy-credits.dto';

@ApiTags('credits')
@Controller({ path: 'credits', version: '1' })
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post('buy')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comprar pacote de créditos' })
  @ApiResponse({ status: 201, description: 'Créditos comprados' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Pacote inválido' })
  async buy(@CurrentUser() user: CurrentUserType, @Body() dto: BuyCreditsDto) {
    return this.creditsService.buy(user.userId, dto.packageId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar compras de créditos' })
  @ApiResponse({ status: 200, description: 'Lista de compras' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async list(@CurrentUser() user: CurrentUserType) {
    return this.creditsService.list(user.userId);
  }
}
