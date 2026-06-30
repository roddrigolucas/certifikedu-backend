import { PrismaClient, PrismaPromise, UserPlans } from '@prisma/client';
import { randomUUID } from 'crypto';
import { IUserData } from './users';

export async function createBasicPlan(prisma: PrismaClient): Promise<string> {
  const plan = await prisma.basicPlans.create({
    data: {
      name: 'Basico',
      description: 'Plano Basico da CertifikEdu',
      isDefault: true,
      pdisQty: 1,
      pdiPeriod: 'forever',
      emittedCertificatesQuota: 10,
      emittedCertificatesPeriod: 'monthly',
      receivedCertificateQuota: 1,
      receivedCertificatePeriod: 'unlimited',
      singleCertificatePrice: 270,
    },
  });

  await createPagarmePlans(prisma);

  return plan.planId;
}

async function createPagarmePlans(prisma: PrismaClient) {
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

  await prisma.pagarmePlans.create({
    data: {
      planId: enterprisePlanId,
      isActive: true,
      planName: 'Empresarial',
      description: 'Tudo do Profissional\\nGestão de equipes\\nRelatórios avançados\\nSuporte prioritário',
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
}

export async function associateUsersToPlan(prisma: PrismaClient, planId: string, userData: IUserData) {
  const querys: Array<PrismaPromise<UserPlans>> = [];
  for (let user of Object.keys(userData)) {
    querys.push(
      prisma.userPlans.create({
        data: {
          userId: userData[user].userId,
          basicSubscription: {
            create: {
              planId: planId,
              cycleEnd: new Date(new Date().setDate(new Date().getDate() + 30)),
              cycleStart: new Date(),
            },
          },
        },
      }),
    );
  }

  await prisma.$transaction(querys);
}
