import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password + (process.env.NEXTAUTH_SECRET || 'dev-secret')).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@foodscore.app' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@foodscore.app',
      password: hashPassword('admin123456'),
      role: 'ADMIN',
    },
  });

  // Create demo user
  const demo = await prisma.user.upsert({
    where: { email: 'demo@foodscore.app' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@foodscore.app',
      password: hashPassword('demo123456'),
      role: 'USER',
    },
  });

  // Add some favorites for demo user
  await prisma.favorite.upsert({
    where: { userId_barcode: { userId: demo.id, barcode: '3017620422003' } },
    update: {},
    create: {
      userId: demo.id,
      barcode: '3017620422003',
      name: 'Nutella',
      score: 2.5,
    },
  });

  console.log('✅ Seed complete!');
  console.log('📧 Admin: admin@foodscore.app / admin123456');
  console.log('📧 Demo:  demo@foodscore.app  / demo123456');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
