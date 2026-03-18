import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import type { User } from '../users/users.service';

export interface ProfileResponse {
  id: string;
  fullName: string;
  email: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  validateJwtToken(token: string): Promise<unknown> {
    try {
      return Promise.resolve(this.jwtService.verify(token));
    } catch {
      throw new UnauthorizedException('Token JWT inválido');
    }
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<LoginResponse> {
    const user = await this.usersService.create(data);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return this.toLoginResponse(user, accessToken);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(email);

    if (
      !user ||
      !(await this.usersService.validatePassword(password, user.passwordHash))
    ) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return this.toLoginResponse(user, accessToken);
  }

  private toLoginResponse(user: User, accessToken: string): LoginResponse {
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return {
      id: user.id,
      fullName: user.name,
      email: user.email,
    };
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.usersService.updatePassword(
      userId,
      currentPassword,
      newPassword,
    );
  }

  async updateProfile(
    userId: string,
    fullName: string,
  ): Promise<ProfileResponse> {
    const user = await this.usersService.updateProfile(userId, fullName);
    return {
      id: user.id,
      fullName: user.name,
      email: user.email,
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.usersService.delete(userId);
  }
}
