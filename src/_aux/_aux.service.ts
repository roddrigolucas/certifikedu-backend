import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretManagerService } from '../aws/secrets-manager/secrets-manager.service';
import * as crypto from 'crypto';
import { TPessoaFisicaOutput, TPessoaJuridicaOutput } from './types/aux.types';
import { PrismaService } from '../prisma/prisma.service';
import { IAbility } from '../abilities/interfaces/abilities.interfaces';
import { TWorkFieldCreateInput } from '../corporate/types/corporate.types';

@Injectable()
export class AuxService implements OnModuleInit {
  cloudfrontBucket: string;
  nestBucket: string;
  algorithm: string;
  certifikeduImages: string;
  defaultTemplate: string;
  environment: string;
  isLocal: boolean;
  localLambda: boolean;
  pdiJwtSecret: string;
  pdiServiceUrl: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly smsService: SecretManagerService,
  ) {}

  async onModuleInit() {
    this.cloudfrontBucket = await this.configService.getOrThrow('APP_S3_BUCKET_CLOUDFRONT');
    this.nestBucket = await this.configService.getOrThrow('APP_S3_BUCKET');
    this.certifikeduImages = await this.configService.getOrThrow('CLOUDFRONT_IMAGES');
    this.defaultTemplate = await this.configService.getOrThrow('CERTIFICATE_PUBLIC_IMAGE_TEMPLATE_URL');
    this.environment = await this.configService.getOrThrow('ENVIRONMENT_TYPE');
    this.pdiServiceUrl = await this.configService.getOrThrow('AI_SERVICE_BASE_URL');

    try {
      await this.configService.getOrThrow('LOCAL_DEVELOPMENT');
      this.isLocal = true;
    } catch (err) {
      this.isLocal = false;
    }

    try {
      const lambdaEnvironment = await this.configService.getOrThrow('LOCAL_LAMBDA');
      if (lambdaEnvironment === 'true') {
        this.localLambda = true;
        this.pdiServiceUrl = 'http://192.168.1.75:3013';
      } else {
        this.localLambda = false;
      }
    } catch (err) {
      this.localLambda = false;
    }

    this.pdiJwtSecret = await this.smsService.getSecretFromKey('PdiJwtSecret');
  }

  async getPjInfo(userId: string): Promise<TPessoaJuridicaOutput> {
    return await this.prismaService.pessoaJuridica.findUnique({ where: { userId: userId } });
  }

  async getPfInfo(userId: string): Promise<TPessoaFisicaOutput> {
    return await this.prismaService.pessoaFisica.findUnique({
      where: { userId: userId },
    });
  }

  getCensoredEmail(email: string): string {
    return `${email.substring(0, 3)}****@${email.split('@')[1]}`;
  }

  async encrypt(text: string, iv: Buffer): Promise<string> {
    const secretId = 'BackendEncryptionKey';

    const secretKey = await this.smsService.getSecretFromKey(secretId);

    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(secretKey), iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('hex');
  }

  async decrypt(hash: { iv: string; content: string }): Promise<string> {
    const secretId = 'BackendEncryptionKey';

    const secretKey = await this.smsService.getSecretFromKey(secretId);

    const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(secretKey), Buffer.from(hash.iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(hash.content, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }

  getCurrentDateAsString(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
  }

  formatDateString(date: Date): string {
    try {
      const today = date;
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const year = today.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (err) {
      return null;
    }
  }

  authFormatDate(date: string): Date {
    let sepString: string;

    try {
      if (date.includes('-')) {
        sepString = '-';
      } else {
        sepString = '/';
      }

      const day = parseInt(date.split(sepString)[0]);
      // Date Object for js starts indexing at 0 ... !!!
      const month = parseInt(date.split(sepString)[1]) - 1;
      const year = parseInt(date.split(sepString)[2]);

      const currentYear: number = new Date().getUTCFullYear();
      if (day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900 && year <= currentYear) {
        return new Date(year, month, day);
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  formatDate(date: string): Date {
    let sepString: string;

    try {
      if (date.includes('-')) {
        sepString = '-';
      } else {
        sepString = '/';
      }

      const day = parseInt(date.split(sepString)[0]);
      // Date Object for js starts indexing at 0 ... !!!
      const month = parseInt(date.split(sepString)[1]) - 1;
      const year = parseInt(date.split(sepString)[2]);

      return new Date(year, month, day);
    } catch (e) {
      return null;
    }
  }

  formatStringDate(date: string): string {
    let sepString: string;

    try {
      if (date.includes('-')) {
        sepString = '-';
      } else {
        sepString = '/';
      }

      const day = parseInt(date.split(sepString)[0]);
      // Date Object for js starts indexing at 0 ... !!!
      const month = parseInt(date.split(sepString)[1]);
      const year = parseInt(date.split(sepString)[2]);

      return `${day}/${month}/${year}`;
    } catch (e) {
      return null;
    }
  }

  generateRandomPassword(): string {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numericChars = '0123456789';
    const specialChars = '!@#$%&';

    // Ensure at least one character from each category is included
    const passwordArray = [
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
      numericChars[Math.floor(Math.random() * numericChars.length)],
      specialChars[Math.floor(Math.random() * specialChars.length)],
    ];

    // Fill the rest of the password length with random characters from all categories
    const allChars = uppercaseChars + lowercaseChars + numericChars + specialChars;
    for (let i = 4; i < 12; i++) {
      passwordArray.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    const password = passwordArray.sort(() => 0.5 - Math.random()).join('');
    return password;
  }

  async getValidWorkFieldsIds(workFields: Array<string>): Promise<Array<string>> {
    const existingFields = await this.prismaService.workFields.findMany({
      where: { workField: { in: workFields } },
    });

    const fieldsNames = existingFields.map((field) => {
      return field.workField;
    });

    const fieldsIds: Array<string> = [];
    const createNewFields: Array<TWorkFieldCreateInput> = [];
    workFields.map((wf) => {
      if (fieldsNames.includes(wf)) {
        fieldsIds.push(existingFields.filter((field) => field.workField === wf).at(0).workFieldId);
      } else {
        const fieldId = crypto.randomUUID();
        fieldsIds.push(fieldId);
        createNewFields.push({ workFieldId: fieldId, workField: wf });
      }
    });

    await this.prismaService.workFields.createMany({
      data: createNewFields,
    });

    return fieldsIds;
  }

  async getValidAbilities(abilitiesIds: Array<string>): Promise<Array<IAbility>> {
    const validAbilityIds = await this.prismaService.abilities.findMany({
      where: { habilidadeId: { in: abilitiesIds } },
    });

    return validAbilityIds.map((ability) => {
      return {
        ability: ability.habilidade,
        category: ability.tema,
        abilityId: ability.habilidadeId,
      };
    });
  }

  async getValidAbilityIds(abilitiesIds: string[]): Promise<string[]> {
    const abilities = await this.prismaService.abilities.findMany({
      where: { habilidadeId: { in: abilitiesIds } },
    });

    return abilities.map((ability) => {
      return ability.habilidadeId;
    });
  }

  async getValidActivityIds(activitiesIds: string[]): Promise<string[]> {
    const activities = await this.prismaService.activities.findMany({
      where: { activityId: { in: activitiesIds } },
    });

    return activities.map((actvity) => {
      return actvity.activityId;
    });
  }

  async getValidInternshipIds(internshipsIds: string[]): Promise<string[]> {
    const internships = await this.prismaService.internships.findMany({
      where: { internshipId: { in: internshipsIds } },
    });

    return internships.map((internship) => {
      return internship.internshipId;
    });
  }
  async getValidSubjectIds(subjectsIds: string[]): Promise<string[]> {
    const subjects = await this.prismaService.subjects.findMany({
      where: { subjectId: { in: subjectsIds } },
    });

    return subjects.map((subject) => {
      return subject.subjectId;
    });
  }

  async getValidSemestersIds(semestersIds: string[]): Promise<string[]> {
    const subjects = await this.prismaService.semester.findMany({
      where: { semesterId: { in: semestersIds } },
    });

    return subjects.map((semester) => {
      return semester.semesterId;
    });
  }

  async getValidStudyFieldsIds(studyFieldIds: string[]): Promise<string[]> {
    const subjects = await this.prismaService.studyField.findMany({
      where: { studyFieldId: { in: studyFieldIds } },
    });

    return subjects.map((studyField) => {
      return studyField.studyFieldId;
    });
  }

  async getValidCurriculumsIds(curriculumIds: string[]): Promise<string[]> {
    const subjects = await this.prismaService.curriculum.findMany({
      where: { curriculumId: { in: curriculumIds } },
    });

    return subjects.map((curriculum) => {
      return curriculum.curriculumId;
    });
  }

  getInverseImagePath(inverseId: string, fileType: string, userId: string): string {
    return `users/${userId}/inverse_images/${inverseId}.${fileType}`;
  }

  getDeletedInverseImagePath(inverseId: string, fileType: string, userId: string): string {
    return `users/${userId}/inverse_images/deleted/${inverseId}.${fileType}`;
  }

  getPublicBackgroundImagePath(backgroundImageId: string, fileType: string): string {
    return `background_images/public/${backgroundImageId}.${fileType}`;
  }

  getDeletedPublicBackgroundImagePath(backgroundImageId: string, fileType: string): string {
    return `background_images/public/deleted/${backgroundImageId}.${fileType}`;
  }

  getPrivateBackgroundImagePath(backgroundImageId: string, fileType: string, userId: string): string {
    return `users/${userId}/background_images/private/${backgroundImageId}.${fileType}`;
  }

  getDeletedPrivateBackgroundImagePath(backgroundImageId: string, fileType: string, userId: string): string {
    return `users/${userId}/background_images/private/deleted/${backgroundImageId}.${fileType}`;
  }

  getTemplateLogoPath(userId: string, templateId: string, version: number, fileType?: string): string {
    return `users/${userId}/templates/${templateId}/v${version}/logos/logo_image.${fileType ?? 'png'}`;
  }

  getTemplateImagePath(userId: string, templateId: string, version: number): string {
    return `users/${userId}/templates/${templateId}/v${version}/template_image.png`;
  }

  getTemplatePreviewPath(userId: string, hash: string): string {
    return `users/${userId}/templates/previews/${hash}.png`;
  }

  getOpenBadgeJsonPath(userId: string, certificateId: string, type: string, version = 1): string {
    return `users/${userId}/certificates/${certificateId}/open_badge/v${version}/${type}.json`;
  }

  getOpenBadgePicturePath(userId: string, certificateId: string, fileType: string, version = 1): string {
    return `users/${userId}/certificates/${certificateId}/open_badge/v${version}/certificate_open_badge.${fileType}`;
  }

  getCertificatePicturePath(userId: string, certificateId: string, fileType: string): string {
    return `users/${userId}/certificates/${certificateId}/certificate_image.${fileType}`;
  }

  getCertificateEvidencePath(userId: string, certificateId: string, evidenceId: string, fileType: string): string {
    return `users/${userId}/certificates/${certificateId}/evidences/${evidenceId}.${fileType}`;
  }

  getCertificateNarrativePath(userId: string, certificateId: string, narrativeId: string, fileType: string): string {
    return `users/${userId}/certificates/${certificateId}/narratives/${narrativeId}.${fileType}`;
  }

  getUserDocumentPicturePath(userId: string, hash: string, fileType: string): string {
    return `users/${userId}/doc_pictures/${hash}.${fileType}`;
  }

  getUserResumePdfPath(userId: string, resumeId: string, version: number): string {
    return `users/${userId}/resume/${resumeId}/v${version}/curriculo_certifikedu.pdf`;
  }
}
