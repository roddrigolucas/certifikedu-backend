const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'r.lucas@fiemg.com.br';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('User not found:', email);
    return;
  }

  const pf = await prisma.pessoaFisica.findUnique({ where: { userId: user.id } });
  if (!pf) {
    console.log('PessoaFisica profile not found for user:', user.email);
    return;
  }

  // Find all PDIs for this user
  const pdis = await prisma.pdi.findMany({
    where: { idPF: pf.idPF }
  });

  console.log(`Found ${pdis.length} PDIs for user ${email}`);

  // Delete all PDIs
  for (const pdi of pdis) {
    await prisma.pdi.delete({
      where: { pdiId: pdi.pdiId }
    });
    console.log(`Deleted PDI: ${pdi.title} (${pdi.pdiId})`);
  }

  console.log('All PDIs deleted successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
