import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestsService } from '../requests/requests.service';
import {
  TTemplateAllowedDocsCreateInput,
  TTemplateBasicData,
  TTemplateCreateInput,
  TTemplateSchoolAbilitiesCourseData,
  TTemplateUpdateInput,
} from './types/template.types';
import { ICreateCertificatePreview, ICreateTemplateLambda } from '../requests/requests.interfaces';
import { S3Service } from '../aws/s3/s3.service';
import { AuxService } from '../aux/aux.service';
import { BackgroundsService } from '../backgrounds/background.service';
import { CertificatesService } from '../certificates/certificates.service';
import { FontsService } from '../fonts/fonts.service';
import { TQueryPromise } from '../aux/types/aux.types';
import { QRCodePositionEnum, User } from '@prisma/client';
import { IStudentInfo } from './interfaces/templates.interfaces';
import { randomUUID } from 'crypto';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly requestsService: RequestsService,
    private readonly s3Service: S3Service,
    private readonly auxService: AuxService,
    private readonly fontsService: FontsService,
    private readonly backgroundsService: BackgroundsService,
    private readonly certificatesService: CertificatesService,
  ) {}

  isExpired(expirationDateTime: Date): boolean {
    const currentDate = new Date(Date.now());
    if (!expirationDateTime) return false;
    return currentDate >= expirationDateTime;
  }

  hasStarted(startDateTime: Date): boolean {
    const currentDate = new Date(Date.now());
    if (!startDateTime) return true;
    return currentDate >= startDateTime;
  }

  isIssueLimitReached(issueLimit: number, issuedCertificates: number): boolean {
    return issueLimit > 0 && issuedCertificates >= issueLimit;
  }

  async checkTemplateById(templateId: string): Promise<{ templateId: string; idPj: string }> {
    const template = await this.prismaService.templates.findUnique({
      where: { templateId: templateId },
      select: { templateId: true, school: { select: { ownerUserId: true } } },
    });

    return { templateId: template.templateId, idPj: template.school.ownerUserId };
  }

  async getTemplateById(templateId: string): Promise<TTemplateSchoolAbilitiesCourseData> {
    return await this.prismaService.templates.findUnique({
      where: { templateId: templateId },
      include: {
        school: { include: { userId: true } },
        habilidades: { include: { habilidade: true } },
        courses: { include: { course: true } },
      },
    });
  }

  async checkIfTemplateHasWhitelist(templateId: string): Promise<boolean> {
    const count = await this.prismaService.templatesAllowedDocuments.count({
      where: { templateId: templateId },
    });

    return count === 0;
  }

  async getAllowedDocumentsForTemplate(templateId: string): Promise<Array<string>> {
    const documents = await this.prismaService.templatesAllowedDocuments.findMany({
      where: { templateId: templateId, hasReceived: false },
      select: { document: true },
    });

    return documents.map((doc) => doc.document);
  }

  async insertTemplateAllowedDocuments(data: Array<TTemplateAllowedDocsCreateInput>) {
    await this.prismaService.templatesAllowedDocuments.createMany({
      data: data,
    });
  }

  async getTemplateEmissionQty(templateId: string): Promise<number> {
    return await this.prismaService.certificates.count({
      where: { templateId: templateId },
    });
  }

  async getTemplateCertificateCount(templateId: string): Promise<number> {
    return await this.prismaService.certificates.count({
      where: { templateId: templateId },
    });
  }

  async updateTemplateSchool(template: TTemplateSchoolAbilitiesCourseData, schoolId: string) {
    if (template.schoolId === schoolId) {
      return null;
    }

    await this.prismaService.templates.update({
      where: { templateId: template.templateId },
      data: { schoolId: schoolId },
    });
  }

  async deleteTemplateRecord(templateId: string) {
    await this.prismaService.templates.delete({
      where: { templateId: templateId },
    });
  }

  async addTemplateToCourse(templateId: string, courseId: string) {
    await this.prismaService.courseTemplates.create({
      data: {
        courseId: courseId,
        templateId: templateId,
      },
    });
  }

  removeTemplateFromCourses(templateId: string): TQueryPromise {
    return this.prismaService.courseTemplates.deleteMany({
      where: { templateId: templateId },
    });
  }

  removeAbilitiesFromTemplate(templateId: string): TQueryPromise {
    return this.prismaService.templateAbilities.deleteMany({
      where: { templateId: templateId },
    });
  }

  async getTemplatesBySchoolId(schoolId: string): Promise<Array<TTemplateSchoolAbilitiesCourseData>> {
    return await this.prismaService.templates.findMany({
      where: { schoolId: schoolId },
      include: {
        school: { include: { userId: true } },
        habilidades: { include: { habilidade: true } },
        courses: { include: { course: true } },
      },
    });
  }

  async getBasicTemplatesBySchoolIds(schoolIds: Array<string>): Promise<Array<TTemplateBasicData>> {
    return await this.prismaService.templates.findMany({
      where: { schoolId: { in: schoolIds } },
      select: {
        templateId: true,
        name: true,
        learningPaths: {
          select: {
            pathId: true,
          },
        },
      },
    });
  }

  async getTemplatesBySchoolIds(schoolIds: Array<string>): Promise<Array<TTemplateSchoolAbilitiesCourseData>> {
    return await this.prismaService.templates.findMany({
      where: { schoolId: { in: schoolIds } },
      include: {
        school: { include: { userId: true } },
        habilidades: { include: { habilidade: true } },
        courses: { include: { course: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplateRecord(data: TTemplateCreateInput): Promise<TTemplateSchoolAbilitiesCourseData> {
    return await this.prismaService.templates.create({
      data: data,
      include: {
        school: { include: { userId: true } },
        habilidades: { include: { habilidade: true } },
        courses: { include: { course: true } },
      },
    });
  }

  async updateTemplateRecord(templateId: string, data: TTemplateUpdateInput) {
    await this.prismaService.templates.update({
      where: { templateId: templateId },
      data: data,
    });
  }

  async getWelcomeTemplateData(): Promise<TTemplateSchoolAbilitiesCourseData> {
    return await this.prismaService.templates.findFirst({
      where: { isWelcome: true },
      include: {
        school: { include: { userId: true } },
        habilidades: { include: { habilidade: true } },
        courses: { include: { course: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async generateImagePreview(lambdaData: ICreateCertificatePreview) {
    await this.requestsService.getOverlapImages(lambdaData);
  }

  async updateTemplate(templateId: string, templateData: TTemplateUpdateInput, issuerName: string) {
    const templateBucket = templateData.backgroundImage.toString().split('/').at(0);
    const templatePath = templateData.backgroundImage.toString().split('/').slice(1).join('/');

    let lambdaData: ICreateTemplateLambda = {
      picture_type: 'template',
      template_bucket: templateBucket,
      template_path: templatePath,
      destination_bucket: this.auxService.cloudfrontBucket,
      destination_path: templateData.certificatePicture.toString(),
      certificate_name: templateData.name.toString(),
      hash: templateId.toString(),
      qrcode_position: templateData.qrCodePosition as QRCodePositionEnum,
      font_color: templateData.hexFontColor.toString() ?? '#000000',
      description_image: templateData.descriptionImage.toString(),
      hours: ((templateData.cargaHoraria as number) / 60).toString(),
      issued_at: this.auxService.formatDateString(templateData.issuedAt as Date),
      issuer: issuerName,
    };

    if (templateData.logoImage) {
      const logoBucket = this.auxService.cloudfrontBucket;
      const logoPath = templateData.logoImage.toString();
      lambdaData = { ...lambdaData, badge_bucket: logoBucket, badge_path: logoPath };
    }

    if (templateData?.fontDesc?.connect?.fontId) {
      lambdaData.font_description_url = await this.fontsService.getFontUrlById(templateData.fontDesc.connect.fontId);
    }

    if (templateData?.fontName?.connect?.fontId) {
      lambdaData.font_description_url = await this.fontsService.getFontUrlById(templateData.fontName.connect.fontId);
    }

    await this.requestsService.getOverlapImages(lambdaData);

    const updateQuery = this.prismaService.templates.update({
      where: { templateId: templateId },
      data: templateData,
    });

    await this.prismaService.$transaction([
      this.removeAbilitiesFromTemplate(templateId),
      this.removeTemplateFromCourses(templateId),
      updateQuery,
    ]);
  }

  async reuploadExistingLogoImage(userId: string, templateId: string, oldLogoPath: string): Promise<string> {
    const templateVersion = 1;

    const fileType = oldLogoPath.split('.').slice(-1).join();

    const logoImage = await this.s3Service.getImageBuffer(this.auxService.cloudfrontBucket, oldLogoPath, fileType);

    const logoPath = this.auxService.getTemplateLogoPath(userId, templateId, templateVersion, fileType);

    await this.s3Service.uploadFile(this.auxService.cloudfrontBucket, logoPath, logoImage);

    return logoPath;
  }

  async uploadLogoImage(
    userId: string,
    templateId: string,
    templateVersion: number,
    logoImage: Express.Multer.File,
  ): Promise<string> {
    const fileType = logoImage.originalname.split('.').slice(-1).join();

    const logoPath = this.auxService.getTemplateLogoPath(userId, templateId, templateVersion, fileType);

    await this.s3Service.uploadFile(this.auxService.cloudfrontBucket, logoPath, logoImage);

    return logoPath;
  }

  async getCloneTemplateCreateInput(
    userId: string,
    templateData: TTemplateSchoolAbilitiesCourseData,
  ): Promise<TTemplateCreateInput> {
    const templateVersion = 1;

    const newTemplateId = randomUUID();
    const templateImageDestinationPath = this.auxService.getTemplateImagePath(userId, newTemplateId, templateVersion);

    const templateInfo: TTemplateCreateInput = {
      templateId: newTemplateId,
      name: `Cópia de ${templateData.name}`,
      description: templateData.description,
      descriptionImage: templateData.descriptionImage,
      cargaHoraria: templateData.cargaHoraria,
      certificatePicture: templateImageDestinationPath,
      issuedAt: templateData.issuedAt,
      logoImage: templateData.logoImage,
      expiresAt: templateData.expiresAt,
      habilidades: {
        create: templateData.habilidades.map((habilidade) => ({ habilidadeId: habilidade.habilidadeId })),
      },
      school: { connect: { schoolId: templateData.schoolId } },
      courses: { create: templateData.courses.map((course) => ({ courseId: course.courseId })) },
      qrCodePosition: templateData.qrCodePosition,
      hexFontColor: templateData.hexFontColor,
    };

    if (templateData?.courses.length > 0) {
      templateInfo.courses.create = templateData.courses.map((course) => {
        return { courseId: course.courseId };
      });
    }

    //FIX THIS ON THE DATABASE
    if (templateData?.logoImage && templateData?.logoImage !== 'false') {
      templateInfo.logoImage = await this.reuploadExistingLogoImage(userId, newTemplateId, templateData.logoImage);
    }

    const backgroundImage = await this.backgroundsService.getFirstAvailableBackground();

    templateInfo.backgroundImage = `${this.auxService.cloudfrontBucket}/${backgroundImage.imageUrl}`;
    templateInfo.backgroundImages = { connect: { backgroundId: backgroundImage.backgroundId } };

    if (templateData?.backgroundId) {
      const backgroundImage = await this.backgroundsService.getBackgroundInfoById(templateData.backgroundId);

      if (backgroundImage.isValid) {
        templateInfo.backgroundImage = `${this.auxService.cloudfrontBucket}/${backgroundImage.imageUrl}`;
        templateInfo.backgroundImages = { connect: { backgroundId: backgroundImage.backgroundId } };
      }
    }

    if (templateData.inverseId) {
      templateInfo.inverseImages = { connect: { inverseId: templateData.inverseId } };
    }

    if (templateData.fontDescId) {
      templateInfo.fontDesc = { connect: { fontId: templateData.fontDescId } };
    }

    if (templateData.fontNameId) {
      templateInfo.fontName = { connect: { fontId: templateData.fontNameId } };
    }

    return templateInfo;
  }

  async createTemplate(
    templateData: TTemplateCreateInput,
    issuerName: string,
  ): Promise<TTemplateSchoolAbilitiesCourseData> {
    const templateBucket = templateData.backgroundImage.split('/').at(0);
    const templatePath = templateData.backgroundImage.split('/').slice(1).join('/');

    let lambdaData: ICreateTemplateLambda = {
      picture_type: 'template',
      template_bucket: templateBucket,
      template_path: templatePath,
      destination_bucket: this.auxService.cloudfrontBucket,
      destination_path: templateData.certificatePicture,
      certificate_name: templateData.name,
      hash: templateData.templateId,
      qrcode_position: templateData.qrCodePosition,
      description_image: templateData.descriptionImage,
      font_color: templateData.hexFontColor ?? '#000000',
      hours: (templateData.cargaHoraria / 60).toString(),
      issued_at: this.auxService.formatDateString(templateData.issuedAt as Date),
      issuer: issuerName,
    };

    if (templateData.logoImage) {
      const logoBucket = this.auxService.cloudfrontBucket;
      const logoPath = templateData.logoImage;
      lambdaData = { ...lambdaData, badge_bucket: logoBucket, badge_path: logoPath };
    }

    if (templateData?.fontDesc?.connect?.fontId) {
      lambdaData.font_description_url = `${this.auxService.certifikeduImages}/${await this.fontsService.getFontUrlById(templateData.fontDesc.connect.fontId)}`;
    }

    if (templateData?.fontName?.connect?.fontId) {
      lambdaData.font_name_url = `${this.auxService.certifikeduImages}/${await this.fontsService.getFontUrlById(templateData.fontName.connect.fontId)}`;
    }

    await this.requestsService.getOverlapImages(lambdaData);

    return await this.createTemplateRecord(templateData);
  }

  async createWelcomeTemplateCertificate(user: User, userName: string) {
    const templateInfo = await this.getWelcomeTemplateData();

    if (!templateInfo) {
      return null;
    }

    const userInfo: IStudentInfo = {
      templateId: templateInfo.templateId,
      name: userName,
      docNumber: user.numeroDocumento,
      email: user.email,
    };

    this.certificatesService.issueCertificateFromTemplate(userInfo, templateInfo);
  }
}
