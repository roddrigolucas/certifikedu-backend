const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

async function main() {
  const existingPlans = await prisma.pagarmePlans.findMany();
  if (existingPlans.length > 0) {
    console.log('Pagarme plans already exist, skipping seed.');
    return;
  }

  const proPlanId = randomUUID();
  const enterprisePlanId = randomUUID();

  await prisma.pagarmePlans.create({
    data: {
      planId: proPlanId,
      isActive: true,
      planName: 'Profissional',
      description: 'Certificados ilimitados\\nPDI trimestral\\nCompartilhamento em redes sociais\\nOpenBadge incluso',
      descriptionPagarme: 'Plano Profissional CertifikEdu',
      recommendend: true,
      interval: 'month',
      installments: [1, 3, 6],
      billingType: 'prepaid',
      billingDays: [],
      pdisQty: 3,
      pdiPeriod: 'trimontlhy',
      emittedCertificatesQuota: 100,
      emittedCertificatesPeriod: 'monthly',
      receivedCertificateQuota: 100,
      receivedCertificatePeriod: 'unlimited',
      singleCertificatePrice: 0,
      montlhyPrice: 2990,
      paymentMethod: ['credit_card'],
      items: {
        create: {
          planItemId: randomUUID(),
          name: 'Assinatura Profissional',
          description: 'Plano mensal profissional',
          quantity: 1,
          cycles: 0,
          schemeType: 'unit',
          price: 2990,
        },
      },
    },
  });
  console.log('[+] Plano Profissional criado');

  await prisma.pagarmePlans.create({
    data: {
      planId: enterprisePlanId,
      isActive: true,
      planName: 'Empresarial',
      description: 'Tudo do Profissional\\nGestao de equipes\\nRelatorios avancados\\nSuporte prioritario',
      descriptionPagarme: 'Plano Empresarial CertifikEdu',
      recommendend: false,
      interval: 'year',
      installments: [1, 6, 12],
      billingType: 'prepaid',
      billingDays: [],
      pdisQty: 10,
      pdiPeriod: 'trimontlhy',
      emittedCertificatesQuota: 1000,
      emittedCertificatesPeriod: 'monthly',
      receivedCertificateQuota: 1000,
      receivedCertificatePeriod: 'unlimited',
      singleCertificatePrice: 0,
      montlhyPrice: 14900,
      paymentMethod: ['credit_card', 'boleto'],
      items: {
        create: {
          planItemId: randomUUID(),
          name: 'Assinatura Empresarial',
          description: 'Plano anual empresarial',
          quantity: 1,
          cycles: 0,
          schemeType: 'unit',
          price: 14900,
        },
      },
    },
  });
  console.log('[+] Plano Empresarial criado');
}

main().catch(console.error).finally(() => prisma.$disconnect());
