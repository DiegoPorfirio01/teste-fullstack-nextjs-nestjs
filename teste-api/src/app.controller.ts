import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { CurrentUser } from './guards/current-user.decorator';
import { Public } from './guards/decorators';
import type { CurrentUserType } from './guards';

@ApiTags('app')
@Controller({ version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Saúde / Olá' })
  @ApiResponse({ status: 200, description: 'Retorna uma saudação' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiTags('auth')
  @ApiOperation({ summary: 'Obter usuário atual' })
  @ApiResponse({ status: 200, description: 'Retorna o usuário autenticado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getMe(@CurrentUser() user: CurrentUserType) {
    return { user };
  }
}
