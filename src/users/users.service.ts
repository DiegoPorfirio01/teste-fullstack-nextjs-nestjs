import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  private mapToUser(entity: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    status: string;
    createdAt: Date;
  }): User {
    return {
      ...entity,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepository.findByEmail(email);
    return entity ? this.mapToUser(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.userRepository.findById(id);
    return entity ? this.mapToUser(entity) : null;
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const hash = await bcrypt.hash(data.password, 10);
    const entity = await this.userRepository.create({
      email: data.email,
      passwordHash: hash,
      name: data.name,
    });
    return this.mapToUser(entity);
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ConflictException('Senha atual inválida');
    const hash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(userId, hash);
  }

  async updateProfile(userId: string, fullName: string): Promise<User> {
    const entity = await this.userRepository.updateProfile(userId, fullName);
    return this.mapToUser(entity);
  }

  async delete(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }

  async validatePassword(
    plainPassword: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
