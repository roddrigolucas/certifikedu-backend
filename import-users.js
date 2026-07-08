const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('./users_backup.json', 'utf8'));
  
  console.log(`Importando ${data.users.length} usuários...`);
  for (const user of data.users) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "users" (id, "createdAt", "updatedAt", email, "numeroDocumento", type, status, "tempName", "freeCertificates", "freeEvents", "apiEnabled", "ltiEnabled", "fromCanvas")
      VALUES ($1, $2, $3, $4, $5, $6::"UserType", $7::"UserStatus", $8, $9, $10, $11, $12, $13)
      ON CONFLICT (email) DO NOTHING;
    `, user.id, new Date(user.createdAt), new Date(user.updatedAt), user.email, user.numeroDocumento, user.type, user.status, user.tempName, user.freeCertificates, user.freeEvents, user.apiEnabled, user.ltiEnabled, user.fromCanvas);
  }

  console.log(`Importando ${data.auth.length} senhas...`);
  for (const auth of data.auth) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO auth_credentials (email, password_hash, user_type, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING;
    `, auth.email, auth.password_hash, auth.user_type, auth.status);
  }

  console.log('✅ Importação concluída com sucesso!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
