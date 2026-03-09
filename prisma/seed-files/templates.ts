import { PrismaClient, PrismaPromise, Templates } from '@prisma/client';

export async function createWelcomeTemplate(prisma: PrismaClient, schoolId: string, courseId: string) {
  const querys: Array<PrismaPromise<Templates>> = [];

  const habilidades = await prisma.abilities.findMany({
    take: 2,
    select: { habilidadeId: true },
  });

  querys.push(
    prisma.templates.create({
      data: {
        name: 'Certificado Boas Vindas',
        description: 'Certificado de Boas Vindas da Certifikedu',
        cargaHoraria: 60,
        isWelcome: true,
        habilidades: { create: habilidades },
        certificatePicture: 'public_certificates/448de79a-fd69-44e3-b4d3-35cc99458b05.png ',
        schoolId: schoolId,
      },
    }),
  );

  querys.push(
    prisma.templates.create({
      data: {
        name: 'Certificado Inicial',
        description: 'Certificado Inicial',
        cargaHoraria: 40,
        isWelcome: true,
        habilidades: { create: habilidades },
        certificatePicture: 'public_certificates/448de79a-fd69-44e3-b4d3-35cc99458b05.png ',
        schoolId: schoolId,
        courses: { create: { courseId: courseId } },
      },
    }),
  );

  await prisma.$transaction(querys);
}
