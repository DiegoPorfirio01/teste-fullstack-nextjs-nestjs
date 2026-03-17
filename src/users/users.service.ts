import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();

  constructor() {
    this.seedUsers();
  }

  private async seedUsers(): Promise<void> {
    const hash = await bcrypt.hash('password123', 10);
    const admin: User = {
      id: randomUUID(),
      email: 'admin@example.com',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
    };
    this.users.set(admin.email, admin);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.get(email.toLowerCase()) ?? null;
  }

  async validatePassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
