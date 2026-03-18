import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../guards/current-user.decorator';
import type { CurrentUserType } from '../guards';
import { Public } from '../guards/decorators';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Registro realizado com sucesso' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register({
      email: dto.email,
      password: dto.password,
      name: dto.name,
    });
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login com e-mail e senha' })
  @ApiResponse({
    status: 201,
    description:
      'Login realizado com sucesso, retorna usuário e token de acesso JWT',
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário atual' })
  @ApiResponse({ status: 200, description: 'Retorna o perfil do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(@CurrentUser() user: CurrentUserType) {
    return this.authService.getProfile(user.userId);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async updateProfile(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.userId, dto.fullName);
  }

  @Patch('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar senha' })
  @ApiResponse({ status: 200, description: 'Senha atualizada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 409, description: 'Senha atual inválida' })
  async updatePassword(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdatePasswordDto,
  ) {
    await this.authService.updatePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return { message: 'Senha atualizada' };
  }

  @Delete('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir conta do usuário atual' })
  @ApiResponse({ status: 200, description: 'Conta excluída' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async deleteAccount(@CurrentUser() user: CurrentUserType) {
    await this.authService.deleteAccount(user.userId);
    return { message: 'Conta excluída' };
  }
}
