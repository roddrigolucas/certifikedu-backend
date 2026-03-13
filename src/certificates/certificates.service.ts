import { Injectable } from '@nestjs/common';
import { CertificateStatus, CertificateSuccessStatus, QRCodePositionEnum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RequestsService } from '../requests/requests.service';
import { OpenBadgeService } from '../openbadge/openbadge.service';
import { CandidateService } from '../candidate/candidate.service';
import { S3Service } from '../aws/s3/s3.service';
import { SQSService } from '../aws/sqs/sqs.service';
import { AbilitiesService } from '../abilities/abilities.service';
import { AuxService } from '../_aux/_aux.service';
import { UsersService } from '../users/users.service';
import { TTemplateSchoolAbilitiesOutput } from '../templates/types/template.types';
import { IResponseOpenBadgeClass } from '../openbadge/interfaces/openbadge.interfaces';
import { TSchoolOutput } from '../schools/types/schools.types';
import { createHash, randomUUID } from 'crypto';
import { PaymentsService } from '../payments/services/payments.service';
import {
  ISignCertificateLambda,
  ILambdaValidateText,
  IIssueSelfCertificateLambda,
} from '../requests/requests.interfaces';
import { IUserCertificatePaymentInfo, PaymentType } from '../payments/interfaces/payments.interfaces';
import {
  TCertificateIdAndSchoolIdOutput,
  TCertificatesCreateInput,
  TCertificateSharingOutput,
  TCertificatesUpdateInput,
  TCertificatesWithAbilitiesAndHashOutput,
  TCertificatesWithAbilitiesOutput,
  TCertificatesWithEvidencesNarrativesOutput,
  TEvidenceOnCertificate,
  TEvidenceOnCertificateWithUser,
} from './types/certificates.types';
import {
  EEmailNameSQS,
  ICertificateEventSQS,
  ICertificateReceptorInfo,
  IConcatenatedReceptorsInfo,
  ICertificateEmissionsListInfo,
} from './interfaces/certificates.interfaces';
import {
  QCertificatesEmissionDetails,
  TCertificatesEmissionDetails,
  QCertificatesEmissionList,
} from './queries/certificates.queries';
import { FontsService } from '../fonts/fonts.service';
import { LearningPathService } from '../learning-paths/path.service';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly abilitiesService: AbilitiesService,
    private readonly auxService: AuxService,
    private readonly fontsService: FontsService,
    private readonly blockchainService: BlockchainService,
    private readonly candidateService: CandidateService,
    private readonly openBadgeService: OpenBadgeService,
    private readonly paymentsService: PaymentsService,
    private readonly requestService: RequestsService,
    private readonly s3Service: S3Service,
    private readonly sqsService: SQSService,
    private readonly usersService: UsersService,
    private readonly learningPaths: LearningPathService,
  ) {}

  async getCertificateById(certificateId: string): Promise<TCertificatesWithAbilitiesAndHashOutput> {
    return await this.prismaService.certificates.findUnique({
      where: { certificateId: certificateId },
      include: {
        habilidades: { include: { habilidade: true } },
        hashes: { where: { isValid: true } },
      },
    });
  }

  async getUserCertificatesAdminByUserDocument(
    userDocument: string,
  ): Promise<Array<TCertificatesWithAbilitiesAndHashOutput>> {
    return await this.prismaService.certificates.findMany({
      where: { OR: [{ receptorDoc: userDocument }, { emissorDoc: userDocument }] },
      include: { habilidades: { include: { habilidade: true } }, hashes: true },
    });
  }

  async getUserCertificatesIdsWithSchoolIdsByDocument(
    userDocument: string,
  ): Promise<Array<TCertificateIdAndSchoolIdOutput>> {
    const certificates = await this.prismaService.certificates.findMany({
      where: { receptorDoc: userDocument },
      select: { certificateId: true, schoolId: true },
    });

    return certificates;
  }

  async getUserCertificatesIdsByDocument(userDocument: string): Promise<Array<string>> {
    const certificates = await this.prismaService.certificates.findMany({
      where: { receptorDoc: userDocument },
      select: { certificateId: true },
    });

    return certificates.map((certificate) => certificate.certificateId);
  }

  async getUserCertificatesByIdPaginatedAdmin(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<Array<TCertificatesWithAbilitiesOutput>> {
    return await this.prismaService.certificates.findMany({
      where: { OR: [{ receptorId: userId }, { emissorId: userId }] },
      include: { habilidades: { include: { habilidade: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      skip,
    });
  }

  async getCertificatesEvidencesCount(certificateId: string): Promise<number> {
    return await this.prismaService.evidenceOpenBadge.count({
      where: { certificateId: certificateId, isDeleted: false },
    });
  }

  async getCertificatesEvidences(certificateId: string): Promise<Array<TEvidenceOnCertificate>> {
    return await this.prismaService.evidenceOpenBadge.findMany({
      where: { certificateId: certificateId, isDeleted: false },
    });
  }

  async getUserCertificatesByIdPaginated(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<Array<TCertificatesWithAbilitiesOutput>> {
    return await this.prismaService.certificates.findMany({
      where: {
        OR: [{ receptorId: userId }, { emissorId: userId }],
        status: { not: CertificateStatus.DISABLED },
      },
      include: { habilidades: { include: { habilidade: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      skip,
    });
  }

  async getCertificateShareByHash(hash: string): Promise<TCertificateSharingOutput> {
    return await this.prismaService.certificatesSharing.findFirst({
      where: { certificateHash: hash, isValid: true },
    });
  }

  async getUserLastCertificates(userId: string): Promise<Array<TCertificatesWithAbilitiesOutput>> {
    return await this.prismaService.certificates.findMany({
      where: { receptorId: userId, status: { not: CertificateStatus.DISABLED } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { habilidades: { include: { habilidade: true } } },
    });
  }

  async getCandidateCertificatesById(userId: string): Promise<Array<TCertificatesWithAbilitiesOutput>> {
    return await this.prismaService.certificates.findMany({
      where: { receptorId: userId },
      include: { habilidades: { include: { habilidade: true } } },
    });
  }

  async createCertificateRecord(data: TCertificatesCreateInput): Promise<TCertificatesWithAbilitiesOutput> {
    return await this.prismaService.certificates.create({
      data: data,
      include: { habilidades: { include: { habilidade: true } } },
    });
  }

  async updateCertificateRecord(
    certificateId: string,
    data: TCertificatesUpdateInput,
  ): Promise<TCertificatesWithAbilitiesOutput> {
    return await this.prismaService.certificates.update({
      where: { certificateId: certificateId },
      data: data,
      include: { habilidades: { include: { habilidade: true } } },
    });
  }

  async getCertificatesWithEvidencesAndNarrativeById(
    certificateId: string,
  ): Promise<TCertificatesWithEvidencesNarrativesOutput> {
    return await this.prismaService.certificates.findUnique({
      where: { certificateId: certificateId },
      include: {
        habilidades: { include: { habilidade: true } },
        school: true,
        evidence: true,
        narrative: true,
      },
    });
  }

  async getCertificatesWithEvidencesAndNarrativeByCpf(
    cpf: string,
  ): Promise<Array<TCertificatesWithEvidencesNarrativesOutput>> {
    return await this.prismaService.certificates.findMany({
      where: { receptorDoc: cpf },
      include: {
        habilidades: { include: { habilidade: true } },
        school: true,
        evidence: true,
        narrative: true,
      },
    });
  }

  async getCertificatesBySchoolId(schoolId: string): Promise<Array<TCertificatesWithEvidencesNarrativesOutput>> {
    return await this.prismaService.certificates.findMany({
      where: { schoolId: schoolId },
      include: {
        habilidades: { include: { habilidade: true } },
        school: true,
        evidence: true,
        narrative: true,
      },
    });
  }

  async getCertificatesByCourseId(courseId: string): Promise<Array<TCertificatesWithAbilitiesOutput>> {
    return await this.prismaService.certificates.findMany({
      where: { template: { courses: { some: { courseId: courseId } } } },
      include: {
        habilidades: { include: { habilidade: true } },
      },
    });
  }

  async getUserEmmitedCertificateCount(userId: string): Promise<number> {
    return await this.prismaService.certificates.count({
      where: { emissorId: userId },
    });
  }

  async disableCertificateHashes(certificateId: string) {
    await this.prismaService.certificatesSharing.updateMany({
      where: { certificateId: certificateId },
      data: { isValid: false },
    });
  }

  async addUserCertificates(userId: string, userDocument: string, userName: string) {
    const updateCertificatesQuery = this.prismaService.certificates.updateMany({
      where: { receptorDoc: userDocument },
      data: { receptorId: userId, receptorName: userName },
    });

    const certificateIds = await this.getUserCertificatesIdsByDocument(userDocument);

    const updateAbilitiesQuery = this.abilitiesService.getUpdateUserAbilitiesQuery(userId, certificateIds);

    await this.prismaService.$transaction([updateCertificatesQuery, updateAbilitiesQuery]);
  }

  async getSelfEmmitedCertificatePaymentType(
    userCredits: IUserCertificatePaymentInfo,
    certificateData: TCertificatesCreateInput,
  ): Promise<TCertificatesCreateInput> {
    if (userCredits.type === PaymentType.basic) {
      const certificate = {
        ...certificateData,
        basicSubscription: { connect: { userSubscriptionId: userCredits.id } },
      };

      return certificate;
    }

    if (userCredits.type === PaymentType.pagarme) {
      const certificate = {
        ...certificateData,
        subscription: { connect: { subscriptionId: userCredits.id } },
      };

      return certificate;
    }

    if (userCredits.type === PaymentType.credit) {
      const certificate = {
        ...certificateData,
        certificateCredit: { connect: { CertificateCreditId: userCredits.id } },
      };

      await this.paymentsService.invalidateCertificateCredit(userCredits.id);
      return certificate;
    }

    return certificateData;
  }

  async createAPICertificate(certificateData: TCertificatesCreateInput, school: TSchoolOutput) {
    const certificate = await this.createCertificateRecord(certificateData);

    const destination_path = this.auxService.getCertificatePicturePath(
      certificate.emissorId,
      certificate.certificateId,
      this.auxService.defaultTemplate.split('.').slice(-1).join(),
    );

    certificate.certificatePicture = destination_path;

    const hash = await this.createNewCertificateHash(
      certificate.certificateId,
      certificate.emissorName,
      certificate.name,
    );

    const updated_abilities = await this.candidateService.updateUserAbilitiesOnProfile(certificate.receptorId);

    await Promise.all([
      this.createCertificatePicture(certificate, hash),
      this.blockchainService.insertNewCertificate(certificate.emissorId, certificate),
      this.createCertificateOpenBadge(certificate, certificate.emissorEmail, school),
      this.requestService.updateProfileAbilitiesLambda(updated_abilities),
    ]);
  }

  async createShareForSelfEmmitedCertificate(certificate: TCertificatesWithAbilitiesOutput) {
    const destination_path = this.auxService.getCertificatePicturePath(
      certificate.emissorId,
      certificate.certificateId,
      this.auxService.defaultTemplate.split('.').slice(-1).join(),
    );

    certificate.certificatePicture = destination_path;

    const hash = await this.createNewCertificateHash(
      certificate.certificateId,
      certificate.emissorName,
      certificate.name,
    );

    const updated_abilities = await this.candidateService.updateUserAbilitiesOnProfile(certificate.receptorId);

    const promises = [];
    promises.push(this.createCertificatePicture(certificate, hash));
    promises.push(this.blockchainService.insertNewCertificate(certificate.emissorId, certificate));

    if (updated_abilities) {
      promises.push(this.requestService.updateProfileAbilitiesLambda(updated_abilities));
    }

    if (certificate?.subscriptionId) {
      promises.push(this.createCertificateOpenBadge(certificate, certificate.emissorEmail));
    }

    await Promise.all(promises);
  }

  async createSelfEmmitedCertificate(
    certificateData: TCertificatesCreateInput,
  ): Promise<TCertificatesWithAbilitiesAndHashOutput> {
    const data: ILambdaValidateText = {
      texts: {
        title: certificateData.name,
        description: certificateData.description,
        descriptionImage: certificateData.descriptionImage,
      },
    };

    const lambdaResponse = await this.requestService.getApproveText(data);

    if (lambdaResponse) {
      certificateData.status = CertificateStatus.ENABLED;
    }

    const certificate = await this.createCertificateRecord(certificateData);

    if (certificate.status === CertificateStatus.ENABLED) {
      await this.createShareForSelfEmmitedCertificate(certificate);
    }

    return this.getCertificateById(certificate.certificateId);
  }

  async createNewCertificateHash(certificateId: string, issuerEmail: string, certificateName: string): Promise<string> {
    const stringHash = `${issuerEmail}${certificateName}${certificateId}`;
    const hash = createHash('sha256').update(stringHash).digest('hex');

    await this.prismaService.certificatesSharing.create({
      data: { certificateId: certificateId, certificateHash: hash },
    });

    return hash;
  }

  async createCertificatePicture(
    certificate: TCertificatesWithAbilitiesOutput,
    certificatePublicHash: string,
  ): Promise<TCertificatesWithAbilitiesOutput> {
    const pictureData: IIssueSelfCertificateLambda = {
      picture_type: 'certificate',
      template_bucket: this.auxService.nestBucket,
      template_path: this.auxService.defaultTemplate,
      destination_bucket: this.auxService.cloudfrontBucket,
      destination_path: this.auxService.getCertificatePicturePath(
        certificate.emissorId,
        certificate.certificateId,
        this.auxService.defaultTemplate.split('.').slice(-1).join(),
      ),
      receptor_name: certificate.receptorName,
      certificate_name: certificate.name,
      hash: certificatePublicHash,
      qrcode_position: QRCodePositionEnum.NULL,
      description_image: certificate.descriptionImage,
      hours: (certificate.cargaHoraria / 60).toString(),
      issued_at: this.auxService.formatDateString(certificate.issuedAt),
      issuer: certificate.emissorName,
    };

    if (certificate.fontDescId && (await this.fontsService.checkFontById(certificate.fontDescId))) {
      const fontUrl = await this.fontsService.getFontUrlById(certificate.fontDescId);

      if (fontUrl) {
        pictureData.font_name_url = fontUrl;
      }
    }

    if (certificate.fontNameId && (await this.fontsService.checkFontById(certificate.fontNameId))) {
      const fontUrl = await this.fontsService.getFontUrlById(certificate.fontNameId);

      if (fontUrl) {
        pictureData.font_description_url = fontUrl;
      }
    }

    await this.requestService.getOverlapImages(pictureData);

    return await this.updateCertificateRecord(certificate.certificateId, {
      certificatePicture: pictureData.destination_path,
    });
  }

  async createCertificateOpenBadge(
    certificate: TCertificatesWithAbilitiesOutput,
    receptorEmail: string,
    school?: TSchoolOutput,
    openBadgeVersion?: number,
  ) {
    const certificateOpenBadge = {
      certificateId: certificate.certificateId,
      recipientEmail: receptorEmail,
      expires: certificate?.expiresAt?.toISOString() ?? null,
      issuedOn: certificate?.issuedAt?.toISOString() ?? certificate.createdAt.toISOString(),
      certificateName: certificate.name,
      certificateDescription: certificate.description,
      certificateImage: certificate.certificatePicture,
      schoolName: school?.name ?? 'CertifikEdu Certificados',
      schoolUrl: school?.homepageUrl ?? 'https://www.certifikedu.com',
      schoolEmail: school?.email ?? 'certifikedu@certifikedu.com',
      narrative: school ? 'Certificado emitido em certifikedu.com' : 'Certificado Auto Emitido.',
      openBadgeVersion: openBadgeVersion,
      destination_bucket: this.auxService.cloudfrontBucket,
      destination_path: this.auxService.getOpenBadgePicturePath(
        certificate.emissorId,
        certificate.certificateId,
        certificate.certificatePicture.split('.').slice(-1).join(),
        openBadgeVersion,
      ),
    };

    await this.openBadgeService.createCertificateOpenBadge(certificate.emissorId, certificateOpenBadge);
  }

  async getOpenBadgeJsonsPaths(certificateId: string): Promise<IResponseOpenBadgeClass> {
    const certificate = await this.prismaService.certificates.findUnique({
      where: { certificateId: certificateId },
      select: { emissorId: true },
    });

    return {
      assertionUrl: this.auxService.getOpenBadgeJsonPath(certificate.emissorId, certificateId, 'assertion'),
      issuerUrl: this.auxService.getOpenBadgeJsonPath(certificate.emissorId, certificateId, 'issuer'),
      badgeUrl: this.auxService.getOpenBadgeJsonPath(certificate.emissorId, certificateId, 'badge_class'),
    };
  }

  async createEvidencesOnCertificate(userId: string, certificateId: string, evidences: Array<Express.Multer.File>) {
    const evidencesData = evidences.map(async (evidence) => {
      const evidenceId = randomUUID();
      const fileType = evidence.mimetype.split('/').at(-1) ?? 'png';
      const s3Url = this.auxService.getCertificateEvidencePath(userId, certificateId, evidenceId, fileType);

      await this.s3Service.uploadFile(this.auxService.nestBucket, s3Url, evidence);

      return {
        id: evidenceId,
        evidenceUrl: s3Url,
        evidenceType: fileType,
        createdByUser: userId,
        certificateId: certificateId,
      };
    });

    const evidenceRecords = await Promise.all(evidencesData);

    await this.prismaService.evidenceOpenBadge.createMany({
      data: evidenceRecords,
    });

    return evidenceRecords;
  }

  async getCertificateEvidenceById(evidenceId: string): Promise<TEvidenceOnCertificateWithUser> {
    return await this.prismaService.evidenceOpenBadge.findUnique({
      where: { id: evidenceId, isDeleted: false },
      include: { certificate: { select: { certificateId: true, emissorId: true, receptorId: true } } },
    });
  }

  async deleteEvidenceFromCertificate(evidenceId: string) {
    return await this.prismaService.evidenceOpenBadge.update({
      where: { id: evidenceId },
      data: { isDeleted: true },
    });
  }

  async createNarrativesOnCertificate(userId: string, certificateId: string, narratives: Array<Express.Multer.File>) {
    const narrativesData = narratives.map(async (narrative) => {
      const narrativeId = randomUUID();
      const fileType = narrative.mimetype.split('/').at(-1) ?? 'png';
      const s3Url = this.auxService.getCertificateNarrativePath(userId, certificateId, narrativeId, fileType);

      await this.s3Service.uploadFile(this.auxService.nestBucket, s3Url, narrative);
      return {
        id: narrativeId,
        narrativeUrl: s3Url,
        narrativeType: fileType,
        createdByUser: userId,
        certificateId: certificateId,
      };
    });

    await this.prismaService.narrativeOpenBadge.createMany({
      data: await Promise.all(narrativesData),
    });
  }

  async checkUserCertificate(document: string, templateId: string): Promise<boolean> {
    const cert = await this.prismaService.certificates.count({
      where: { receptorDoc: document, templateId: templateId },
    });

    if (cert > 0) {
      return true;
    }

    return false;
  }

  async issueCertificateFromTemplate(
    studentInfo: ICertificateReceptorInfo,
    templateInfo: TTemplateSchoolAbilitiesOutput,
    emissionId?: string,
  ) {
    if (await this.checkUserCertificate(studentInfo.docNumber, templateInfo.templateId)) {
      return null;
    }

    const certificateId = randomUUID();
    const fileType = templateInfo.certificatePicture.split('.').slice(-1).join();
    const certificateInfo: TCertificatesCreateInput = {
      certificateId: certificateId,
      emissionId,
      successStatus: CertificateSuccessStatus.PENDING,
      user: { connect: { id: templateInfo.school.userId.userId } },
      emissorName: templateInfo.school.userId.nomeFantasia,
      receptorDoc: studentInfo.docNumber,
      receptorName: studentInfo.name,
      receptorEmail: studentInfo.email,
      description: templateInfo.description,
      status: CertificateStatus.ENABLED,
      name: templateInfo.name,
      cargaHoraria: templateInfo.cargaHoraria,
      issuedAt: templateInfo.issuedAt,
      paymentType: 'free',
      certificatePicture: this.auxService.getCertificatePicturePath(
        templateInfo.school.userId.userId,
        certificateId,
        fileType,
      ),
      school: { connect: { schoolId: templateInfo.schoolId } },
      template: { connect: { templateId: templateInfo.templateId } },
      habilidades: {
        create: templateInfo.habilidades.map((ability) => ({
          habilidadeId: ability.habilidadeId,
        })),
      },
    };

    const userInfo = await this.usersService.getPessoaFisicaByDocument(studentInfo.docNumber);

    if (userInfo?.pessoaFisica?.idPF) {
      certificateInfo.receptorId = userInfo.id;
      certificateInfo.habilidades.create = templateInfo.habilidades.map((ability) => {
        return {
          habilidadeId: ability.habilidadeId,
          userId: userInfo.id,
        };
      });
      if (userInfo.pessoaFisica) {
        certificateInfo.receptorName = userInfo.pessoaFisica.nome;
        await this.learningPaths.associatePfOnEmission(userInfo.pessoaFisica.idPF, templateInfo.templateId);
      }
    }

    if (templateInfo.fontDescId) {
      certificateInfo.fontDesc = { connect: { fontId: templateInfo.fontDescId } };
    }

    if (templateInfo.fontNameId) {
      certificateInfo.fontName = { connect: { fontId: templateInfo.fontNameId } };
    }

    const certificate = await this.createCertificateRecord(certificateInfo);

    const certificateHash = await this.createNewCertificateHash(
      certificate.certificateId,
      certificate.emissorEmail,
      certificate.name,
    );

    const certificateOpenBadge = {
      certificateId: certificate.certificateId,
      recipientEmail: studentInfo.email,
      expires: certificate?.expiresAt?.toISOString() ?? null,
      issuedOn: certificate?.issuedAt?.toISOString() ?? certificate.createdAt.toISOString(),
      certificateName: certificate.name,
      certificateDescription: certificate.description,
      certificateImage: certificate.certificatePicture,
      schoolName: templateInfo.school?.name ?? 'CertifikEdu Certificados',
      schoolUrl: templateInfo.school?.homepageUrl ?? 'https://www.certifikedu.com',
      schoolEmail: templateInfo.school?.email ?? 'certifikedu@certifikedu.com',
      openBadgeVersion: 1,
      destination_bucket: this.auxService.cloudfrontBucket,
      destination_path: this.auxService.getOpenBadgePicturePath(
        certificate.emissorId,
        certificate.certificateId,
        fileType,
      ),
    };

    const imageInfo: ISignCertificateLambda = {
      picture_type: 'sign',
      template_bucket: this.auxService.cloudfrontBucket,
      template_path: templateInfo.certificatePicture,
      destination_bucket: this.auxService.cloudfrontBucket,
      destination_path: this.auxService.getCertificatePicturePath(
        certificate.emissorId,
        certificate.certificateId,
        templateInfo.certificatePicture.split('.').slice(-1).join(),
      ),
      receptor_name: studentInfo.name,
      hash: certificateHash,
      qrcode_position: templateInfo.qrCodePosition,
      font_color: templateInfo.hexFontColor ?? '#000000',
    };

    if (templateInfo.fontNameId && (await this.fontsService.checkFontById(templateInfo.fontNameId))) {
      imageInfo.font_name_url = await this.fontsService.getFontUrlById(templateInfo.fontNameId);
    }

    const eventData: ICertificateEventSQS = {
      Sign: imageInfo,
      OpenBadge: await this.openBadgeService.getFullOpenBadgeClass(
        templateInfo.school.userId.userId,
        certificateOpenBadge,
      ),
      EmailInfo: {
        email: studentInfo.email,
        templateName: templateInfo.isWelcome ? EEmailNameSQS.welcome : EEmailNameSQS.template,
        templateData: {
          imageUrl: `${this.auxService.certifikeduImages}/${imageInfo.destination_path}`,
          name: studentInfo.name,
        },
      },
    };

    if (userInfo?.pessoaFisica?.professionalProfile) {
      const updated_abilities = await this.candidateService.updateUserAbilitiesOnProfile(userInfo.id);

      if (updated_abilities) {
        eventData.UpdateAbilities = updated_abilities;
      }
    }

    if (!this.auxService.localLambda) {
      await this.sqsService.sendEvent(eventData, randomUUID());
    } else {
      await this.requestService.sendLocalSqsRequest(eventData);
    }

    await this.blockchainService.insertNewCertificate(certificate.emissorId, certificate);

    return { success: true };
  }

  async listCertificateGroupedEvents(emissorId: string): Promise<{ eventsInfo: ICertificateEmissionsListInfo[] }> {
    const distinctEvents = await this.prismaService.certificates.findMany({
      select: QCertificatesEmissionList,
      distinct: ['emissionId'],
      where: {
        emissorId,
        emissionId: { not: null },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const counts = await this.prismaService.certificates.groupBy({
      by: ['emissionId', 'successStatus'],
      where: {
        emissorId,
        emissionId: { in: distinctEvents.map((event) => event.emissionId) },
      },
      _count: {
        successStatus: true,
      },
    });

    const emissionsInfo = distinctEvents.map((event) => {
      return {
        emissionId: event.emissionId,
        templateId: event.template.templateId,
        templateName: event.template.name,
        courseName: event.template.courses[0]?.course?.name,
        createdAt: event.createdAt,
        schoolName: event.school.name,
        certificateSuccessEvents:
          counts.find(
            (count) =>
              count.successStatus === CertificateSuccessStatus.SUCCESS && count.emissionId === event.emissionId,
          )?._count.successStatus ?? 0,
        certificateFailedEvents:
          counts.find(
            (count) => count.successStatus === CertificateSuccessStatus.FAILED && count.emissionId === event.emissionId,
          )?._count.successStatus ?? 0,
        certificatePendingEvents:
          counts.find(
            (count) =>
              count.successStatus === CertificateSuccessStatus.PENDING && count.emissionId === event.emissionId,
          )?._count.successStatus ?? 0,
      };
    });

    return { eventsInfo: emissionsInfo };
  }

  async getCertificateEventDetails(
    emissionId: string,
  ): Promise<{ events: TCertificatesEmissionDetails[] } & { receptorsInfo: IConcatenatedReceptorsInfo }> {
    const events = await this.prismaService.certificates.findMany({
      where: { emissionId },
      select: QCertificatesEmissionDetails,
    });

    const receptorCpfs = events.map((event) => event.receptorDoc);

    const existingUsers = await this.usersService.getManyPessoaFisicaByCPFWithBasicInfo(receptorCpfs);

    const nonExistingUsersEvents = events.filter(
      (event) => !existingUsers.some((user) => user.CPF === event.receptorDoc),
    );
    const existingUsersEvents = events.filter((event) => existingUsers.some((user) => user.CPF === event.receptorDoc));

    const receptorsInfo: IConcatenatedReceptorsInfo = {
      nonExistingUsers: nonExistingUsersEvents.map((event) => ({
        document: event.receptorDoc,
        name: event.receptorName,
        email: null,
        phoneNumber: null,
        certificateSuccessStatus: event.successStatus,
      })),
      existingUsers: existingUsers.map((user) => ({
        document: user.CPF,
        name: user.nome,
        email: user.email,
        phoneNumber: user.telefone,
        certificateSuccessStatus: existingUsersEvents.find((event) => event.receptorDoc === user.CPF)?.successStatus,
      })),
    };

    return { events, receptorsInfo };
  }
}
