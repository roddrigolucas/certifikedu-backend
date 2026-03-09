import { Prisma } from '@prisma/client';

export type TCertificatesCreateInput = Prisma.CertificatesCreateInput;
export type TCertificatesUpdateInput = Prisma.CertificatesUpdateInput;

export type TCertificatesOutput = Prisma.CertificatesGetPayload<{}>;

export type TCertificateIdAndSchoolIdOutput = Prisma.CertificatesGetPayload<{
  select: { certificateId: true; schoolId: true };
}>;

export type TCertificatesWithAbilitiesOutput = Prisma.CertificatesGetPayload<{
  include: { habilidades: { include: { habilidade: true } } };
}>;

export type TCertificatesWithAbilitiesAndHashOutput = Prisma.CertificatesGetPayload<{
  include: { habilidades: { include: { habilidade: true } }; hashes: true };
}>;

export type TCertificatesWithAbilitiesAndHashAndOpenBadgeOutput = Prisma.CertificatesGetPayload<{
  include: {
    template: { select: { inverseImages: { select: { imageUrl: true } } } };
    habilidades: {
      include: {
        habilidade: true;
      };
    };
    hashes: true;
    openBadgeModel: true;
    evidence: true;
  };
}>;

export type TCertificateSharingOutput = Prisma.CertificatesSharingGetPayload<{}>;
export type TNarrativeOutput = Prisma.NarrativeOpenBadgeGetPayload<{}>;
export type TEvidenceOutput = Prisma.EvidenceOpenBadgeGetPayload<{}>;

export type TCertificatesWithEvidencesNarrativesOutput = Prisma.CertificatesGetPayload<{
  include: { habilidades: { include: { habilidade: true } }; school: true; evidence: true; narrative: true };
}>;

export type TEvidenceOnCertificate = Prisma.EvidenceOpenBadgeGetPayload<{}>;
export type TEvidenceOnCertificateWithUser = Prisma.EvidenceOpenBadgeGetPayload<{
  include: { certificate: { select: { certificateId: true; emissorId: true; receptorId: true } } };
}>;
