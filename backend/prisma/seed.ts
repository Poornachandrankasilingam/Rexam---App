import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Rexam Database with Demo Accounts...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userAdminPassword = await bcrypt.hash('962943', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Seed Primary Super Admin Account
  const mainAdmin = await prisma.user.upsert({
    where: { email: 'poornachandran106@gmail.com' },
    update: {
      password: userAdminPassword,
      name: 'Poornachandran (Super Admin)',
      role: 'SUPER_ADMIN',
      emailVerified: true
    },
    create: {
      email: 'poornachandran106@gmail.com',
      password: userAdminPassword,
      name: 'Poornachandran (Super Admin)',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      phone: '9629430000'
    }
  });
  console.log(`✅ Main Super Admin Account Seeded: ${mainAdmin.email} (Password: 962943, Role: SUPER_ADMIN)`);

  // Seed Demo Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rexam.com' },
    update: {
      password: adminPassword,
      name: 'Demo Admin',
      role: 'ADMIN',
      emailVerified: true
    },
    create: {
      email: 'admin@rexam.com',
      password: adminPassword,
      name: 'Demo Admin',
      role: 'ADMIN',
      emailVerified: true,
      phone: '9999999999'
    }
  });
  console.log(`✅ Admin Account Seeded: ${admin.email} (Password: admin123)`);

  // Seed Student Account
  const student = await prisma.user.upsert({
    where: { email: 'student@rexam.com' },
    update: {
      password: studentPassword,
      name: 'Demo Student',
      role: 'STUDENT'
    },
    create: {
      email: 'student@rexam.com',
      password: studentPassword,
      name: 'Demo Student',
      role: 'STUDENT',
      phone: '8888888888'
    }
  });
  console.log(`✅ Student Account Seeded: ${student.email} (Password: student123)`);

  console.log('🎉 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
