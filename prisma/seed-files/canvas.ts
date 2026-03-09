import { CanvasEphemeralLogin, CanvasLTIConfiguration, CanvasUser, PrismaClient, PrismaPromise } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function createCanvasInfo(
  prisma: PrismaClient,
  idPJ: string,
  idPfs: Array<string>,
  pjUserId: string,
  canvasSchoolId: string,
  canvasCourseId: string,
) {
  const querys: Array<PrismaPromise<CanvasLTIConfiguration | CanvasUser | CanvasEphemeralLogin>> = [];
  querys.push(
    prisma.canvasLTIConfiguration.create({
      data: {
        canvasDomain: 'TESTE_LOCAL',
        canvasClientIdLTI: 'TESTE_LOCAL',
        canvasClientSecretLTI: 'TESTE_LOCAL',
        canvasClientIdDevKey: 'TESTE_LOCAL',
        canvasClientSecretDevKey: 'TESTE_LOCAL',
        iv: 'TESTE_LOCAL',
        idPJ: idPJ,
      },
    }),
  );

  let i = 1;
  idPfs.map((id) => {
    querys.push(
      prisma.canvasUser.create({
        data: {
          canvasUserId: i,
          canvasEmail: `${id}@canvasemail.com`,
          canvasName: 'Juca Bala',
          canvasDomain: 'TESTE_LOCAL',
          isTeacher: true,
          tempDocument: 'LOCAL_PRA_TESTE',
          idPF: id,
        },
      }),
    );

    i++
  });

  Array.from({ length: 100 }, () => {
    querys.push(
      prisma.canvasEphemeralLogin.create({
        data: {
          state: randomUUID(),
          expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
          isValid: true,
          isDeleted: false,
          userId: pjUserId,
          courseId: canvasCourseId,
          schoolId: canvasSchoolId,
        },
      }),
    );
  });

  await prisma.$transaction(querys);
}
