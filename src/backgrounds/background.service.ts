import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TPessoaJuridicaOutput } from 'src/aux/types/aux.types';
import { AuxService } from '../aux/aux.service';
import { S3Service } from '../aws/s3/s3.service';
import { PrismaService } from '../prisma/prisma.service';
import { TBackgroundCertificateImagesCreateInput, TBackgroundCertificateImagesOutput } from './types/backgrounds.types';

@Injectable()
export class BackgroundsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
    private readonly auxService: AuxService,
  ) {}

  async getBackgroundInfoById(backgroundId: string): Promise<TBackgroundCertificateImagesOutput> {
    return await this.prismaService.backgroundCertificateImages.findUnique({
      where: { backgroundId: backgroundId },
    });
  }

  async getFirstAvailableBackground(): Promise<TBackgroundCertificateImagesOutput> {
    return await this.prismaService.backgroundCertificateImages.findFirst({
      where: { AND: [{ isValid: true }, { isPublic: true }] },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBackgroundRecord(
    data: TBackgroundCertificateImagesCreateInput,
  ): Promise<TBackgroundCertificateImagesOutput> {
    return await this.prismaService.backgroundCertificateImages.create({
      data: data,
    });
  }

  async deleteBackgroundRecord(backgroundId: string, newPath: string) {
    await this.prismaService.backgroundCertificateImages.update({
      where: { backgroundId: backgroundId },
      data: {
        isValid: false,
        imageUrl: newPath,
      },
    });
  }

  //PUBLIC ------------------------------------------------------------------------------------
  async getPublicBackgroundImagesRecords(): Promise<Array<TBackgroundCertificateImagesOutput>> {
    return await this.prismaService.backgroundCertificateImages.findMany({
      where: { isValid: true, isPublic: true },
    });
  }

  async createPulicBackgroundImage(file: Express.Multer.File) {
    const backgroundId = randomUUID();
    const fileType = file.originalname.split('.').slice(-1).join();

    const filePath = this.auxService.getPublicBackgroundImagePath(backgroundId, fileType);

    const bucket = this.auxService.cloudfrontBucket;

    await this.s3Service.uploadFile(bucket, filePath, file);

    const backgroundData: TBackgroundCertificateImagesCreateInput = {
      backgroundId: backgroundId,
      imageUrl: filePath,
      imageType: fileType,
      bucket: bucket,
      isPublic: true,
    };

    await this.createBackgroundRecord(backgroundData);
  }

  async deletePublicBackgroundImage(background: TBackgroundCertificateImagesOutput) {
    const bucket = this.auxService.cloudfrontBucket;

    const deleteBackgroundFilePath = this.auxService.getDeletedPublicBackgroundImagePath(
      background.backgroundId,
      background.imageType,
    );

    await this.s3Service.moveFile(bucket, background.imageUrl, bucket, deleteBackgroundFilePath);

    await this.deleteBackgroundRecord(background.backgroundId, deleteBackgroundFilePath);
  }

  //PRIVATE ------------------------------------------------------------------------------------
  async getPrivateBackgroundImagesRecords(idPj: string): Promise<Array<TBackgroundCertificateImagesOutput>> {
    return await this.prismaService.backgroundCertificateImages.findMany({
      where: {
        OR: [{ idPJ: idPj }, { isPublic: true }],
        isValid: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPrivateBackgroundImage(pj: TPessoaJuridicaOutput, file: Express.Multer.File) {
    const backgroundId = randomUUID();
    const fileType = file.originalname.split('.').slice(-1).join();

    const bucket = this.auxService.cloudfrontBucket;

    const filePath = this.auxService.getPrivateBackgroundImagePath(backgroundId, fileType, pj.userId);

    await this.s3Service.uploadFile(bucket, filePath, file);

    const data: TBackgroundCertificateImagesCreateInput = {
      backgroundId: backgroundId,
      imageUrl: filePath,
      imageType: fileType,
      bucket: bucket,
      pessoaJuridica: { connect: { idPJ: pj.idPJ } },
    };

    await this.createBackgroundRecord(data);
  }

  async deletePrivateBackgroundImage(userId: string, background: TBackgroundCertificateImagesOutput) {
    const bucket = this.auxService.cloudfrontBucket;

    const deleteBackgroundFilePath = this.auxService.getDeletedPrivateBackgroundImagePath(
      background.backgroundId,
      background.imageType,
      userId,
    );

    await this.s3Service.moveFile(bucket, background.imageUrl, bucket, deleteBackgroundFilePath);

    await this.deleteBackgroundRecord(background.backgroundId, deleteBackgroundFilePath);
  }
}
