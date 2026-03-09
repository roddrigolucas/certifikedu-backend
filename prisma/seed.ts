import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

import { createUsers, IUserData } from './seed-files/users';
import { populateAbilities } from './seed-files/abilities';
import { createEmployeeRecords } from './seed-files/employees';
import { createCanvasInfo } from './seed-files/canvas';
import { associateUsersToPlan, createBasicPlan } from './seed-files/plans';
import { createSchools } from './seed-files/schools';
import { createCourse } from './seed-files/courses';
import { createWelcomeTemplate } from './seed-files/templates';
import { loadFonts } from './seed-files/fonts';

const prisma = new PrismaClient();

const userData: IUserData = {
  admin: {
    userId: randomUUID(),
    typeId: randomUUID(),
  },
  pf: {
    userId: randomUUID(),
    typeId: randomUUID(),
  },
  pj: {
    userId: randomUUID(),
    typeId: randomUUID(),
  },
  gui: {
    userId: randomUUID(),
    typeId: randomUUID(),
  },
};

async function main() {
  await populateAbilities(prisma);
  console.log('[+] Abilities Created Successfully.');
  const planId = await createBasicPlan(prisma);
  console.log('[+] Basic Plan Created Successfully.');
  await createUsers(prisma, userData);
  console.log('[+] Users Created Successfully.');
  await associateUsersToPlan(prisma, planId, userData);
  console.log('[+] Users Plans Created Successfully.');

  const pfIds: Array<string> = [userData.pf.typeId, userData.gui.typeId];
  createEmployeeRecords(prisma, userData.pj.typeId, pfIds);
  console.log('[+] Employee Permissions Created Successfully.');

  const { certifikeduSchoolId, canvasSchoolId } = await createSchools(prisma, userData.pj.typeId, pfIds);
  console.log('[+] Schools Created Successfully.');
  const { initialCourseId, canvasCourseId } = await createCourse(
    prisma,
    userData.pj.typeId,
    certifikeduSchoolId,
    canvasSchoolId,
    pfIds,
  );
  console.log('[+] Courses Created Successfully.');

  await createWelcomeTemplate(prisma, certifikeduSchoolId, initialCourseId);
  console.log('[+] Templates Created Successfully.');
  await createCanvasInfo(prisma, userData.pj.typeId, pfIds, userData.pj.userId, canvasSchoolId, canvasCourseId);
  console.log('[+] Canvas Basic Infra Created Successfully.');

  console.log('[-] Loading Fonts and Variants');
  await loadFonts(prisma);
  console.log('[+] Fonts and variants Loaded Successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
