const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  const email = 'api.escola@uepg.br';
  const cnpj = '80257355000108_API'; // Suffix to bypass unique constraint as an exception
  const name = 'integração PROEX UEPG';
  const razaoSocial = 'Universidade Estadual de Ponta Grossa (Autarquia Estadual)';
  const phone = '(42) 3220-3481';
  const password = 'Certifik&Integra123';

  console.log(`Iniciando criação do usuário PJ: ${email}...`);

  // Hash password
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);

  // 1. Upsert AuthCredentials
  await prisma.authCredentials.upsert({
    where: { email },
    update: {
      password_hash: hash,
      user_type: 'PJ',
      status: 'CONFIRMED',
    },
    create: {
      email,
      password_hash: hash,
      user_type: 'PJ',
      status: 'CONFIRMED',
    },
  });
  console.log('✅ AuthCredentials criado/atualizado.');

  // 2. Check or create User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { numeroDocumento: cnpj } });
  }

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        numeroDocumento: cnpj,
        type: 'PJ',
        status: 'ENABLED',
      },
    });
    console.log(`✅ User já existia, atualizado ID: ${user.id}`);
  } else {
    user = await prisma.user.create({
      data: {
        email,
        numeroDocumento: cnpj,
        type: 'PJ',
        status: 'ENABLED',
      },
    });
    console.log(`✅ User criado com ID: ${user.id}`);
  }

  // 3. Upsert PessoaJuridica
  let pj = await prisma.pessoaJuridica.findUnique({ where: { userId: user.id } });
  if (!pj) {
    pj = await prisma.pessoaJuridica.findUnique({ where: { CNPJ: cnpj } });
  }

  if (pj) {
    pj = await prisma.pessoaJuridica.update({
      where: { idPJ: pj.idPJ },
      data: {
        userId: user.id,
        CNPJ: cnpj,
        email,
        razaoSocial,
        nomeFantasia: name,
        telefone: phone,
        segmento: 'Educacional',
        numeroDeFuncionarios: 10,
      },
    });
    console.log(`✅ PessoaJuridica atualizada ID: ${pj.idPJ}`);
  } else {
    pj = await prisma.pessoaJuridica.create({
      data: {
        userId: user.id,
        CNPJ: cnpj,
        email,
        razaoSocial,
        nomeFantasia: name,
        telefone: phone,
        dataDeFundacao: new Date('1969-11-06T00:00:00.000Z'),
        segmento: 'Educacional',
        numeroDeFuncionarios: 10,
      },
    });
    console.log(`✅ PessoaJuridica criada ID: ${pj.idPJ}`);
  }

  // 4. Upsert Socios
  const existingSocio = await prisma.socios.findFirst({
    where: { pessoaJuridicaId: pj.idPJ },
  });

  if (!existingSocio) {
    await prisma.socios.create({
      data: {
        userId: user.id,
        pessoaJuridicaId: pj.idPJ,
        CPF: '00000000000',
        nome: name,
        telefone: phone,
        dataDeNascimento: new Date('1990-01-01T00:00:00.000Z'),
        cepNumber: '84010680',
        estado: 'PR',
        cidade: 'Ponta Grossa',
        bairro: 'Centro',
        rua: 'Praça Marechal Floriano Peixoto',
        numero: '129',
        complemento: '',
      },
    });
    console.log('✅ Sócio associado à PJ criado.');
  }

  console.log(`🎉 USUÁRIO PJ INTEGRAÇÃO PROEX UEPG CRIADO COM SUCESSO NO BANCO DE DADOS!`);
  console.log(`E-mail: ${email}`);
  console.log(`CNPJ: ${cnpj} (Exceção)`);
}

run()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário PJ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
