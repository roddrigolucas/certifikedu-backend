import { Prisma } from '@prisma/client';
import { listResumeQuery, resumeWithDetails } from '../queries/resume.queries';

export type TResumeCreateInput = Prisma.ResumeCreateInput;

export type TResumeUpdateInput = Prisma.ResumeUpdateInput;

export type TResumeWithDetailsOutput = Prisma.ResumeGetPayload<{
  select: typeof resumeWithDetails;
}>;

export type TResumeOutput = Prisma.ResumeGetPayload<{
  select: typeof listResumeQuery;
}>;

export type TResumeExperienceUpdate = Prisma.ResumeExperienceUpdateWithWhereUniqueWithoutResumeInput;
export type TResumeExperienceCreate = Prisma.ResumeExperienceCreateWithoutResumeInput;
export type TResumeExperienceDelete = Prisma.ResumeExperienceWhereUniqueInput;
export type TResumeExperienceUpdateWihtoutResume = Prisma.ResumeExperienceUpdateWithoutResumeInput;
export type TResumeExperienceCreateWihtoutResume = Prisma.ResumeExperienceCreateWithoutResumeInput;

export type TResumeEducationUpdate = Prisma.ResumeEducationUpdateWithWhereUniqueWithoutResumeInput;
export type TResumeEducationCreate = Prisma.ResumeEducationCreateWithoutResumeInput;
export type TResumeEducationDelete = Prisma.ResumeEducationWhereUniqueInput;
export type TResumeEducationUpdateWihtoutResume = Prisma.ResumeEducationUpdateWithoutResumeInput;
export type TResumeEducationCreateWihtoutResume = Prisma.ResumeEducationCreateWithoutResumeInput;

export type TResumeLanguageUpdate = Prisma.ResumeLanguageUpdateWithWhereUniqueWithoutResumeInput;
export type TResumeLanguageCreate = Prisma.ResumeLanguageCreateWithoutResumeInput;
export type TResumeLanguageDelete = Prisma.ResumeLanguageWhereUniqueInput;
export type TResumeLanguageUpdateWihtoutResume = Prisma.ResumeLanguageUpdateWithoutResumeInput;
export type TResumeLanguageCreateWihtoutResume = Prisma.ResumeLanguageCreateWithoutResumeInput;
