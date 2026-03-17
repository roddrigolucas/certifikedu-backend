const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'r.lucas@fiemg.com.br' } });
  console.log('User in Prisma user table:', user ? 'EXISTE' : 'NÃO EXISTE');
  
  if (user) {
     const credentials = await prisma.$queryRawUnsafe(`SELECT * FROM auth_credentials WHERE email = $1`, 'r.lucas@fiemg.com.br');
     console.log('Credentials:', credentials);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
