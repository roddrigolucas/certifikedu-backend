import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plan = await prisma.basicPlans.findFirst({
    where: { isDefault: true },
  });

  if (!plan) {
    await prisma.basicPlans.create({
      data: {
        name: 'Plano Padrão',
        description: 'Plano inicial de teste',
        isDefault: true,
        pdisQty: 10,
        pdiPeriod: 'monthly',
        emittedCertificatesQuota: 10,
        emittedCertificatesPeriod: 'monthly',
        receivedCertificateQuota: 10,
        receivedCertificatePeriod: 'monthly',
        singleCertificatePrice: 1000,
      },
    });
    console.log('Plano padrão criado com sucesso!');
  } else {
    console.log('Plano padrão já existe.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
