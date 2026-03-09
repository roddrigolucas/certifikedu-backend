import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../logger/custom-logger.service';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly uploadDir: string;

  constructor(
    private logger: CustomLogger,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getLocalPath(bucketName: string, key: string): string {
    const dir = path.join(this.uploadDir, bucketName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, key.replace(/\//g, '_'));
  }

  async getImageBuffer(bucketName: string, key: string, fileType: string): Promise<Express.Multer.File> {
    const filePath = this.getLocalPath(bucketName, key);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const buffer = fs.readFileSync(filePath);

    const multerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: `logo_image.${fileType}`,
      encoding: '7bit',
      size: buffer.length,
      mimetype: 'image/png',
      buffer: buffer,
      stream: Readable.from(buffer),
      destination: '',
      filename: `logo_image.${fileType}`,
      path: filePath,
    };

    return multerFile;
  }

  async uploadBuffer(bucket: string, key: string, buffer: Buffer) {
    const filePath = this.getLocalPath(bucket, key);
    fs.writeFileSync(filePath, buffer);
  }

  async uploadFile(bucket: string, key: string, file: Express.Multer.File) {
    const filePath = this.getLocalPath(bucket, key);
    fs.writeFileSync(filePath, file.buffer);
  }

  async getObject(bucketName: string, key: string): Promise<Readable> {
    const filePath = this.getLocalPath(bucketName, key);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    return fs.createReadStream(filePath);
  }

  async getBase64FromBuffer(readable: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of readable) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return buffer.toString('base64');
  }

  async copyFile(
    sourceBucket: string,
    sourceKey: string,
    destinationBucket: string,
    destinationKey: string,
  ): Promise<{ success: boolean }> {
    try {
      const srcPath = this.getLocalPath(sourceBucket, sourceKey);
      const dstPath = this.getLocalPath(destinationBucket, destinationKey);
      fs.copyFileSync(srcPath, dstPath);
    } catch (e) {
      this.logger.error(e);
      return { success: false };
    }

    return { success: true };
  }

  async deleteFile(sourceBucket: string, sourceKey: string): Promise<{ success: boolean }> {
    try {
      const filePath = this.getLocalPath(sourceBucket, sourceKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      this.logger.error(e);
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
