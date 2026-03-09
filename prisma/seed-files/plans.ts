import { PrismaClient, PrismaPromise, UserPlans } from '@prisma/client';
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

  return plan.planId;
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
