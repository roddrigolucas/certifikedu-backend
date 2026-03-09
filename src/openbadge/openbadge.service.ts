import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IBakeOpenBadge } from '../requests/requests.interfaces';
import { RequestsService } from '../requests/requests.service';
import { createHash } from 'crypto';
import { S3Service } from '../aws/s3/s3.service';
import {
  IAssertion,
  IBadgeClass,
  ICreateOpenBadge,
  IIssuer,
  IResponseOpenBadgeClass,
} from './interfaces/openbadge.interfaces';
import { AuxService } from '../aux/aux.service';

@Injectable()
export class OpenBadgeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auxService: AuxService,
    private readonly requestService: RequestsService,
    private readonly s3Service: S3Service,
  ) { }

  private async uploadJsons(
    dto: IAssertion | IIssuer | IBadgeClass,
    userId: string,
    certificateId: string,
    version: number,
    type: 'assertion' | 'badge_class' | 'issuer',
  ) {
    const json = JSON.stringify(dto);

    const s3Url = this.auxService.getOpenBadgeJsonPath(userId, certificateId, type, version);

    await this.s3Service.uploadBuffer(this.auxService.cloudfrontBucket, s3Url, Buffer.from(json));
  }

  private async createAssertionOpenBadgeJson(userId: string, certificateData: ICreateOpenBadge) {
    const assertionData: IAssertion = {
      '@context': 'https://w3id.org/openbadges/v2',
      type: 'Assertion',
      id: `${this.auxService.certifikeduImages}/${this.auxService.getOpenBadgeJsonPath(
        userId,
        certificateData.certificateId,
        'assertion',
        certificateData.openBadgeVersion,
      )}`,
      recipient: {
        type: 'email',
        hashed: true,
        identity: this.getHashedIdentity(certificateData.recipientEmail),
      },
      badge: `${this.auxService.certifikeduImages}/${this.auxService.getOpenBadgeJsonPath(
        userId,
        certificateData.certificateId,
        'badge_class',
        certificateData.openBadgeVersion,
      )}`,
      issuedOn: certificateData.issuedOn,
      verification: {
        type: 'hosted',
      },
    };

    await this.uploadJsons(
      assertionData,
      userId,
      certificateData.certificateId,
      certificateData.openBadgeVersion,
      'assertion',
    );
  }

  private async createBadgeClassOpenBadgeJson(userId: string, certificateData: ICreateOpenBadge) {
    const badgeData: IBadgeClass = {
      '@context': 'https://w3id.org/openbadges/v2',
      type: 'BadgeClass',
      id: `${this.auxService.certifikeduImages}/${this.auxService.getOpenBadgeJsonPath(
        userId,
        certificateData.certificateId,
        'badge_class',
        certificateData.openBadgeVersion,
      )}`,
      name: certificateData.certificateName,
      description: certificateData.certificateDescription,
      image: `${this.auxService.certifikeduImages}/${certificateData.certificateImage}`,
      criteria: {
        narrative: certificateData?.narrative ?? 'Temp Narrative',
      },
      issuer: `${this.auxService.certifikeduImages}/${this.auxService.getOpenBadgeJsonPath(
        userId,
        certificateData.certificateId,
        'issuer',
        certificateData.openBadgeVersion,
      )}`,
    };

    await this.uploadJsons(
      badgeData,
      userId,
      certificateData.certificateId,
      certificateData.openBadgeVersion,
      'badge_class',
    );
  }

  private async createIssuerOpenBadgeJson(userId: string, certificateData: ICreateOpenBadge) {
    const issuerData: IIssuer = {
      '@context': 'https://w3id.org/openbadges/v2',
      type: 'Issuer',
      id: `${this.auxService.certifikeduImages}/${this.auxService.getOpenBadgeJsonPath(
        userId,
        certificateData.certificateId,
        'issuer',
        certificateData.openBadgeVersion,
      )}`,
      name: certificateData.schoolName,
      url: certificateData.schoolUrl,
      email: certificateData.schoolEmail,
      verification: {
        startsWith: this.auxService.certifikeduImages,
      },
    };

    await this.uploadJsons(
      issuerData,
      userId,
      certificateData.certificateId,
      certificateData.openBadgeVersion,
      'issuer',
    );
  }

  private getHashedIdentity(email: string): string {
    return `sha256$${createHash('sha256').update(email).digest('hex')}`;
  }

  private async createOpenBadgeClassJson(userId: string, certificateData: ICreateOpenBadge): Promise<IBakeOpenBadge> {
    return {
      s3_image_path: `${this.auxService.cloudfrontBucket}/${certificateData.certificateImage}`,
      badge_class: [
        {
          '@context': 'https://w3id.org/openbadges/v2',
          type: 'Assertion',
          id: `${this.auxService.certifikeduImages}/${this.auxService.getOpenBadgeJsonPath(
            userId,
            certificateData.certificateId,
            'assertion',
            certificateData.openBadgeVersion,
          )}`,
          recipient: {
            type: 'email',
            hashed: true,
            identity: this.getHashedIdentity(certificateData.recipientEmail),
          },
          issuedOn: certificateData.issuedOn,
          verification: {
            type: 'hosted',
          },
          badge: {
            '@context': 'https://w3id.org/openbadges/v2',
            type: 'BadgeClass',
            id: `${this.auxService.certifikeduImages}/${this.auxService.getOpenBadgeJsonPath(
              userId,
              certificateData.certificateId,
              'badge_class',
              certificateData.openBadgeVersion,
            )}`,
            name: certificateData.certificateName,
            description: certificateData.certificateDescription,
            image: `${this.auxService.certifikeduImages}/${certificateData.certificateImage}`,
            criteria: {
              narrative: 'Certifikedu Certificate',
            },
          },
          issuer: {
            '@context': 'https://w3id.org/openbadges/v2',
            type: 'Issuer',
            id:`${this.auxService.certifikeduImages}/${this.auxService.getOpenBadgeJsonPath(
              userId,
              certificateData.certificateId,
              'issuer',
              certificateData.openBadgeVersion,
            )}`,
            name: certificateData.schoolName,
            url: certificateData.schoolUrl,
            email: certificateData.schoolEmail,
            verification: {
              startsWith: this.auxService.certifikeduImages,
            },
          },
        },
      ],
      destination_path: certificateData.destination_path,
      destination_bucket: this.auxService.cloudfrontBucket,
    };
  }

  private async updateCertificateRecordOpenBadge(certificateId: string, internalOpenBadge: IResponseOpenBadgeClass) {
    await this.prismaService.certificates.update({
      where: { certificateId: certificateId },
      data: {
        openBadge: true,
        openBadgeModel: {
          create: internalOpenBadge,
        },
      },
    });
  }

  async getFullOpenBadgeClass(userId: string, certificateData: ICreateOpenBadge): Promise<IBakeOpenBadge> {
    await this.createAssertionOpenBadgeJson(userId, certificateData);
    await this.createBadgeClassOpenBadgeJson(userId, certificateData);
    await this.createIssuerOpenBadgeJson(userId, certificateData);

    return await this.createOpenBadgeClassJson(userId, certificateData);
  }

  async createCertificateOpenBadge(userId: string, certificateData: ICreateOpenBadge) {
    const classData = await this.getFullOpenBadgeClass(userId, certificateData);

    await this.requestService.bakeOpenBadge(classData);

    await this.updateCertificateRecordOpenBadge(certificateData.certificateId, {
      assertionUrl: this.auxService.getOpenBadgeJsonPath(
        userId,
        certificateData.certificateId,
        'assertion',
        certificateData.openBadgeVersion,
      ),
      issuerUrl: this.auxService.getOpenBadgeJsonPath(
        userId,
        certificateData.certificateId,
        'issuer',
        certificateData.openBadgeVersion,
      ),
      badgeUrl: this.auxService.getOpenBadgeJsonPath(
        userId,
        certificateData.certificateId,
        'badge_class',
        certificateData.openBadgeVersion,
      ),
    });
  }
}
