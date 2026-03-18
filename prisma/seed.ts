import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const url = process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL is required for seeding');
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existing) {
    const hash = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: hash,
        name: 'Admin User',
        role: 'admin',
        status: 'active',
      },
    });
    console.log('Admin user created: admin@example.com / password123');
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
