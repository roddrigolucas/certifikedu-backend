const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const targetEmail = 'r.lucas@certifikedu.com';
  const oldEmail = 'r.lucas@fiemg.com.br';
  const cpf = '10593983629';

  const existingNew = await prisma.user.findUnique({ where: { email: targetEmail } });
  
  if (existingNew) {
    await prisma.$executeRawUnsafe(`UPDATE "users" SET "numeroDocumento" = '00000000000_OLD' WHERE "numeroDocumento" = '${cpf}' AND email != '${targetEmail}'`);
    await prisma.$executeRawUnsafe(`UPDATE "users" SET "numeroDocumento" = '${cpf}', status = 'ENABLED' WHERE email = '${targetEmail}'`);
    await prisma.$executeRawUnsafe(`UPDATE auth_credentials SET status = 'CONFIRMED' WHERE email = '${targetEmail}'`);
    console.log('✅ O cadastro r.lucas@certifikedu.com já existia: o CPF foi forçado para 10593983629 e a conta foi ATIVADA!');
  } else {
    await prisma.$executeRawUnsafe(`UPDATE "users" SET email = '${targetEmail}', status = 'ENABLED' WHERE "numeroDocumento" = '${cpf}'`);
    await prisma.$executeRawUnsafe(`UPDATE auth_credentials SET email = '${targetEmail}', status = 'CONFIRMED' WHERE email = '${oldEmail}'`);
    console.log('✅ Conta r.lucas@fiemg.com.br renomeada com sucesso para r.lucas@certifikedu.com, e ATIVADA!');
  }

  const hash = await bcrypt.hash('Admin123!', 10);
  await prisma.$executeRawUnsafe(`UPDATE auth_credentials SET password_hash = '${hash}' WHERE email = '${targetEmail}'`);
  console.log('✅ Senha do r.lucas@certifikedu.com definida para: Admin123!');

  await prisma.$disconnect();
}
main().catch(console.error);
