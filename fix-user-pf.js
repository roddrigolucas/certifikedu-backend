const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'r.lucas@fiemg.com.br';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    const pf = await prisma.pessoaFisica.findUnique({ where: { userId: user.id } });
    if (!pf) {
      await prisma.pessoaFisica.create({
        data: {
          CPF: user.numeroDocumento,
          email: user.email,
          nome: user.tempName || 'Rodrigo Lucas',
          telefone: user.tempPhone || '31984136164',
          dataDeNascimento: new Date('1991-09-03'),
          cepNumber: '32115100',
          estado: 'MG',
          cidade: 'Contagem',
          bairro: 'Kennedy',
          rua: 'Rua',
          numero: '0',
          userId: user.id
        }
      });
      console.log('PessoaFisica created for user:', user.email);
    } else {
      console.log('PessoaFisica already exists for user:', user.email);
    }

    // Now make the frontend use the back-end loaded data
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
