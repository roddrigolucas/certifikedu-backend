const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('Conectando ao banco de dados local...');
  try {
    const users = await prisma.user.findMany();
    const auth = await prisma.$queryRawUnsafe('SELECT * FROM auth_credentials');
    
    fs.writeFileSync('users_backup.json', JSON.stringify({ users, auth }, null, 2));
    console.log('✅ Usuários exportados com sucesso para users_backup.json!');
    console.log(`Total: ${users.length} usuários, ${auth.length} senhas.`);
  } catch (err) {
    console.error('❌ Erro ao conectar no banco local:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
