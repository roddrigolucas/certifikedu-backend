import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../logger/custom-logger.service';
import { Readable } from 'stream';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(
    private logger: CustomLogger,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      endpoint: this.configService.get('AWS_ENDPOINT') || 'http://minio:9000',
      forcePathStyle: true, // Required for MinIO
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || 'minioadmin',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || 'minioadmin',
      },
    });
  }

  async getImageBuffer(bucketName: string, key: string, fileType: string): Promise<Express.Multer.File> {
    try {
      const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;

      const buffer = await this.streamToBuffer(stream);

      return {
        fieldname: 'file',
        originalname: `logo_image.${fileType}`,
        encoding: '7bit',
        size: buffer.length,
        mimetype: response.ContentType || 'image/png',
        buffer: buffer,
        stream: Readable.from(buffer),
        destination: '',
        filename: `logo_image.${fileType}`,
        path: key,
      } as Express.Multer.File;
    } catch (e) {
      this.logger.error(`Error getting image buffer: ${e.message}`);
      throw e;
    }
  }

  async uploadBuffer(bucket: string, key: string, buffer: Buffer) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
    });
    await this.s3Client.send(command);
  }

  async uploadFile(bucket: string, key: string, file: Express.Multer.File) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await this.s3Client.send(command);
  }

  async getObject(bucketName: string, key: string): Promise<Readable> {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const response = await this.s3Client.send(command);
    return response.Body as Readable;
  }

  async getBase64FromBuffer(readable: Readable): Promise<string> {
    const buffer = await this.streamToBuffer(readable);
    return buffer.toString('base64');
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async copyFile(
    sourceBucket: string,
    sourceKey: string,
    destinationBucket: string,
    destinationKey: string,
  ): Promise<{ success: boolean }> {
    try {
      const command = new CopyObjectCommand({
        CopySource: `${sourceBucket}/${sourceKey}`,
        Bucket: destinationBucket,
        Key: destinationKey,
      });
      await this.s3Client.send(command);
    } catch (e) {
      this.logger.error(`Error copying file: ${e.message}`);
      return { success: false };
    }
    return { success: true };
  }

  async deleteFile(sourceBucket: string, sourceKey: string): Promise<{ success: boolean }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: sourceBucket,
        Key: sourceKey,
      });
      await this.s3Client.send(command);
    } catch (e) {
      this.logger.error(`Error deleting file: ${e.message}`);
      return { success: false };
    }
    return { success: true };
  }

  async moveFile(
    sourceBucket: string,
    sourceKey: string,
    destinationBucket: string,
    destinationKey: string,
  ): Promise<{ success: boolean }> {
    const copy = await this.copyFile(sourceBucket, sourceKey, destinationBucket, destinationKey);

    if (!copy.success) {
      return copy;
    }

    return await this.deleteFile(sourceBucket, sourceKey);
  }
}
