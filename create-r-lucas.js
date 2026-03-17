const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'r.lucas@fiemg.com.br';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create the user in Prisma
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        numeroDocumento: '00000000000',
        type: 'PF',
        tempName: 'Rodrigo Lucas'
      }
    });
    console.log('User created:', user.email);
  } else {
    console.log('User already exists in Prisma:', user.email);
  }

  // 2. Create the credentials in auth_credentials
  await prisma.$executeRawUnsafe(
    `INSERT INTO auth_credentials (email, password_hash, user_type, status) VALUES ($1, $2, $3, 'CONFIRMED') ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
    user.email,
    hashedPassword,
    user.type
  );
  console.log('Credentials updated for:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
