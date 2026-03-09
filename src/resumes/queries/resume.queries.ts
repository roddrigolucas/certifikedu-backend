import { Prisma } from '@prisma/client';

export const listResumeQuery = Prisma.validator<Prisma.ResumeSelect>()({
  resumeId: true,
  createdAt: true,
  title: true,
});

export const resumeWithDetails = Prisma.validator<Prisma.ResumeSelect>()({
  resumeId: true,
  description: true,
  title: true,
  createdAt: true,
  hasPdf: true,
  pdfPath: true,
  pdfVersion: true,
  languages: {
    select: {
      resumeLanguageId: true,
      language: true,
      level: true,
      certificates: {
        select: {
          certificate: {
            select: {
              certificateId: true,
              name: true,
              description: true,
              hashes: { where: { isValid: true }, select: { certificateHash: true } },
              certificatePicture: true,
              createdAt: true,
            },
          },
        },
      },
    },
  },
  idPF: true,
  experiences: {
    select: {
      resumeExperienceId: true,
      title: true,
      description: true,
      startYear: true,
      startMonth: true,
      endYear: true,
      endMonth: true,
      employmentType: true,
      workModel: true,
      certificates: {
        select: {
          certificate: {
            select: {
              certificateId: true,
              name: true,
              description: true,
              hashes: { where: { isValid: true }, select: { certificateHash: true } },
              certificatePicture: true,
              createdAt: true,
            },
          },
        },
      },
      rawPJ: {
        select: {
          rawPJId: true,
          name: true,
          email: true,
          phone: true,
          cnpj: true,
          location: true,
        },
      },
    },
  },
  education: {
    select: {
      resumeEducationId: true,
      title: true,
      description: true,
      startYear: true,
      startMonth: true,
      endYear: true,
      endMonth: true,
      certificates: {
        select: {
          certificate: {
            select: {
              certificateId: true,
              name: true,
              description: true,
              hashes: { where: { isValid: true }, select: { certificateHash: true } },
              certificatePicture: true,
              createdAt: true,
            },
          },
        },
      },
      rawPJ: {
        select: {
          rawPJId: true,
          name: true,
          email: true,
          phone: true,
          cnpj: true,
          location: true,
        },
      },
    },
  },
});
