import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'amolgraphicsonline@gmail.com';
  const password = 'Amolgraphics@2026';
  const hashedPassword = await bcrypt.hash(password, 12);

  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', email);
    // Ensure they have the admin role
    await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    console.log('Verified admin role privileges.');
  } else {
    await prisma.user.create({
      data: {
        id: `user_${Date.now()}`,
        email,
        name: 'Master Admin',
        password: hashedPassword,
        role: 'admin'
      }
    });
    console.log('🚀 Created new Master Admin account:');
    console.log('Email:', email);
    console.log('Password:', password);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
