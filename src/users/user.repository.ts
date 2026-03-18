import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name.trim(),
        role: 'user',
        status: 'active',
      },
    });
    return user;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async updateProfile(id: string, name: string): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { name: name.trim() },
    });
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
