import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.workFields.deleteMany();
    await tx.workFieldOnJobOpportunity.deleteMany();
    await tx.workFieldOnProfessionalProfile.deleteMany();
    await tx.jobOpportunity.deleteMany();
    await tx.pessoaFisicaOnJobOpportunity.deleteMany();
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
