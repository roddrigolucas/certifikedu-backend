const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin123!', 10);
  
  await prisma.$executeRawUnsafe(
    `INSERT INTO "User" (id, email, type, "numeroDocumento", status, "createdAt", "updatedAt") 
     VALUES (gen_random_uuid(), 'admin@certifikedu.com', 'PJ', '00000000000', 'ENABLED', NOW(), NOW()) 
     ON CONFLICT (email) DO NOTHING`
  );
  
  await prisma.$executeRawUnsafe(
    `INSERT INTO auth_credentials (email, password_hash, user_type, status) 
     VALUES ('admin@certifikedu.com', $1, 'PJ', 'CONFIRMED') 
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    hash
  );
  
  console.log('✅ ADMIN CRIADO COM SUCESSO!');
  await prisma.$disconnect();
}

main().catch(e => { 
  console.error('ERRO:', e); 
  process.exit(1); 
});
