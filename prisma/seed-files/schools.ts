import { PrismaClient, PrismaPromise, Schools } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function createSchools(
  prisma: PrismaClient,
  pjId: string,
  students: Array<string>,
): Promise<{
  certifikeduSchoolId: string;
  canvasSchoolId: string;
}> {
  const querys: Array<PrismaPromise<Schools>> = [];

  const canvasSchoolId = randomUUID();
  const certifikeduSchoolId = randomUUID();

  querys.push(
    prisma.schools.create({
      data: {
        schoolId: certifikeduSchoolId,
        schoolCnpj: '11111111111111',
        homepageUrl: 'https://certifikedu.com',
        phoneNumber: '11297432582',
        description: 'CertifiKedu Certificados',
        email: 'default@default.com',
        name: 'CertifikEDU',
        ownerUserId: pjId,
      },
    }),
  );

  querys.push(
    prisma.schools.create({
      data: {
        schoolId: canvasSchoolId,
        schoolCnpj: '22222222222222',
        homepageUrl: 'https://certifikedu.com',
        phoneNumber: '98231984432',
        description: 'CertifiKedu Certificados',
        email: 'latexaria@latexaria.com',
        name: 'Canvas School',
        ownerUserId: pjId,
        isCanvas: true,
        students: {
          connect: students.map((s) => {
            return { idPF: s };
          }),
        },
      },
    }),
  );

  await prisma.$transaction(querys);

  return { certifikeduSchoolId: certifikeduSchoolId, canvasSchoolId: canvasSchoolId };
}
