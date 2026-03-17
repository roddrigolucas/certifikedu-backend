const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'r.lucas@fiemg.com.br';
  await prisma.user.update({
    where: { email },
    data: { status: 'ENABLED' }
  });
  console.log('User status updated to ENABLED!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
