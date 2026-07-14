const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin123!', 10);
  const emails = [
    'rodrigolucassantoss@icloud.com', 
    'r.lucas@fiemg.com.br', 
    'RODRIGO@CERTIFIKEDU.COM.BR'
  ];
  
  for (let email of emails) { 
    await prisma.$executeRawUnsafe(`UPDATE auth_credentials SET password_hash = '${hash}' WHERE LOWER(email) = LOWER('${email}')`);
    console.log('✅ Senha alterada para Admin123!: ' + email); 
  }
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
