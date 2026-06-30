const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'r.lucas@fiemg.com.br';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('User not found:', email);
    return;
  }

  // Check if they already have any active subscription or plan
  const existingPlan = await prisma.userPlans.findFirst({
    where: { userId: user.id }
  });

  if (existingPlan) {
    console.log('User already has a plan/subscription:', existingPlan);
    return;
  }

  // Find the default basic plan
  const defaultPlan = await prisma.basicPlans.findFirst({
    where: { isDefault: true },
    orderBy: { createdAt: 'desc' }
  });

  if (!defaultPlan) {
    // If no default basic plan exists, let's look for any basicPlan
    const anyPlan = await prisma.basicPlans.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    if (!anyPlan) {
      console.log('Error: No basic plans found in the database!');
      return;
    }
    console.log('Using basic plan:', anyPlan.planId);
    await createPlan(user.id, anyPlan.planId);
  } else {
    console.log('Using default basic plan:', defaultPlan.planId);
    await createPlan(user.id, defaultPlan.planId);
  }
}

async function createPlan(userId, planId) {
  const date = new Date();
  const cycleEnd = new Date();
  cycleEnd.setDate(cycleEnd.getDate() + 30);

  const plan = await prisma.userPlans.create({
    data: {
      userId: userId,
      basicSubscription: {
        create: {
          cycleStart: date,
          cycleEnd: cycleEnd,
          planId: planId,
        },
      },
    }
  });

  console.log('Subscription successfully created for r.lucas:', plan);
}

main().catch(console.error).finally(() => prisma.$disconnect());
