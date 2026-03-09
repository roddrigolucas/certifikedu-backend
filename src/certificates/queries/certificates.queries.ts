import { Prisma } from '@prisma/client';

export const QCertificatesEmissionDetails = Prisma.validator<Prisma.CertificatesSelect>()({
  emissionId: true,
  template: { select: { templateId: true, name: true, courses: { select: { courseId: true, course: { select: { name: true } } } } } },
  receptorId: true,
  receptorDoc: true,
  receptorName: true,
  emissorDoc: true,
  emissorName: true,
  emissorEmail: true,
  school: { select: { name: true } },
  successStatus: true,
  createdAt: true,
});

export type TCertificatesEmissionDetails = Prisma.CertificatesGetPayload<{ select: typeof QCertificatesEmissionDetails }>;

export const QCertificatesEmissionList = Prisma.validator<Prisma.CertificatesSelect>()({
  emissionId: true,
  template: { select: { templateId: true, name: true, courses: { select: { courseId: true, course: { select: { name: true } } } } } },
  receptorDoc: true,
  emissorEmail: true,
  school: { select: { name: true } },
  createdAt: true,
  successStatus: true,
});
