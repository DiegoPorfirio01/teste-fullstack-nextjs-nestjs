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
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health / Hello' })
  @ApiResponse({ status: 200, description: 'Returns a greeting' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@CurrentUser() user: CurrentUserType) {
    return { user };
  }
}
