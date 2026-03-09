import { Injectable } from '@nestjs/common';
import { AuxService } from 'src/aux/aux.service';
import { S3Service } from 'src/aws/s3/s3.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TInverseCertificateImagesCreateInput, TInverseCertificateImagesOutput } from './types/inverse.types';
import { randomUUID } from 'crypto';
import { TPessoaJuridicaOutput } from 'src/aux/types/aux.types';

@Injectable()
export class InverseService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
    private readonly auxService: AuxService,
  ) {}

  async getInverseInfoById(inverseId: string): Promise<TInverseCertificateImagesOutput> {
    return await this.prismaService.inverseCertificateImages.findUnique({
      where: { inverseId: inverseId },
    });
  }

  async createInverseRecord(data: TInverseCertificateImagesCreateInput): Promise<TInverseCertificateImagesOutput> {
    return await this.prismaService.inverseCertificateImages.create({
      data: data,
    });
  }

  async deleteInverseRecord(inverseId: string, newPath: string) {
    await this.prismaService.inverseCertificateImages.update({
      where: { inverseId: inverseId },
      data: {
        isValid: false,
        imageUrl: newPath,
      },
    });
  }

  async getInverseImagesRecords(idPj: string): Promise<Array<TInverseCertificateImagesOutput>> {
    return await this.prismaService.inverseCertificateImages.findMany({
      where: {
        idPJ: idPj,
        isValid: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInverseImage(pj: TPessoaJuridicaOutput, file: Express.Multer.File) {
    const inverseId = randomUUID();
    const fileType = file.originalname.split('.').slice(-1).join();

    const bucket = this.auxService.cloudfrontBucket;

    const filePath = this.auxService.getInverseImagePath(inverseId, fileType, pj.userId);

    await this.s3Service.uploadFile(bucket, filePath, file);

    const data: TInverseCertificateImagesCreateInput = {
      inverseId: inverseId,
      imageUrl: filePath,
      imageType: fileType,
      bucket: bucket,
      pessoaJuridica: { connect: { idPJ: pj.idPJ } },
    };

    await this.createInverseRecord(data);
  }

  async deleteInverseImage(userId: string, inverse: TInverseCertificateImagesOutput) {
    const bucket = this.auxService.cloudfrontBucket;

    const deleteInverseFilePath = this.auxService.getDeletedInverseImagePath(
      inverse.inverseId,
      inverse.imageType,
      userId,
    );

    await this.s3Service.moveFile(bucket, inverse.imageUrl, bucket, deleteInverseFilePath);

    await this.deleteInverseRecord(inverse.inverseId, deleteInverseFilePath);
  }
}
