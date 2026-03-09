import { CorporateAdmins, PJAdmins, PrismaClient, PrismaPromise } from '@prisma/client';

export async function createEmployeeRecords(prisma: PrismaClient, idPJ: string, employeeIds: Array<string>) {
  const querys: Array<PrismaPromise<PJAdmins | CorporateAdmins>> = [];

  try {
    employeeIds.map((id) => {
      querys.push(
        prisma.pJAdmins.create({
          data: {
            idPJ: idPJ,
            idPF: id,
            role: 'admin',
          },
        }),
      );

      querys.push(
        prisma.corporateAdmins.create({
          data: {
            idPJ: idPJ,
            idPF: id,
            role: 'admin',
          },
        }),
      );
    });

    await prisma.$transaction(querys);
  } catch (err) {
    console.log("error creating Employee Records", err)
    throw new Error(err)
  }
}
