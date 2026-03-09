import { Course, PrismaClient, PrismaPromise } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function createCourse(
  prisma: PrismaClient,
  idPj: string,
  certifikeduSchoolId: string,
  canvasSchoolId: string,
  students: Array<string>,
): Promise<{
  initialCourseId: string;
  canvasCourseId: string;
}> {
  const querys: Array<PrismaPromise<Course>> = [];

  const initialCourseId = randomUUID();
  const canvasCourseId = randomUUID();

  querys.push(
    prisma.course.create({
      data: {
        courseId: initialCourseId,
        user: { connect: { idPJ: idPj } },
        name: 'Curso Inicial',
        description: 'Curso Inicial',
        educationLevel: 'Graduacao',
        isAcademic: true,
        schools: { create: { schoolId: certifikeduSchoolId } },
        students: {
          create: students.map((s) => {
            return { idPF: s };
          }),
        },
      },
    }),
  );

  querys.push(
    prisma.course.create({
      data: {
        courseId: canvasCourseId,
        name: 'Curso Canvas',
        description: 'Curso Canvas',
        educationLevel: 'Graduacao',
        user: { connect: { idPJ: idPj } },
        schools: { create: { schoolId: canvasSchoolId } },
        students: {
          create: students.map((s) => {
            return { idPF: s };
          }),
        },
      },
    }),
  );

  await prisma.$transaction(querys);

  return { initialCourseId, canvasCourseId };
}
