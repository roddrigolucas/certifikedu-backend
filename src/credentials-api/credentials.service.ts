import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TUserOutput } from '../users/types/user.types';
import { TApiKeyCreateInput, TApiKeyOutput } from './types/credentials.types';

@Injectable()
export class CredentialsService {
  constructor(private readonly prismaService: PrismaService, private readonly config: ConfigService) {}

  async enableUserAPI(userId: string): Promise<TUserOutput> {
    return await this.prismaService.user.update({
      where: { id: userId },
      data: { apiEnabled: true },
    });
  }

  async disableUserKeys(userId: string) {
    await this.prismaService.apiKeys.updateMany({
      where: { userId: userId },
      data: { isDeleted: true },
    });
  }

  async deleteUserKey(keyId: string) {
    await this.prismaService.apiKeys.update({
      where: { apiKeyId: keyId },
      data: { isDeleted: true },
    });
  }

  async disableUserAPI(userId: string) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { apiEnabled: false },
    });
  }

  async getUserValidKey(userId: string): Promise<TApiKeyOutput> {
    return await this.prismaService.apiKeys.findFirst({
      where: {
        userId: userId,
        isDeleted: false,
      },
    });
  }

  async createApiKeyRecord(data: TApiKeyCreateInput): Promise<TApiKeyOutput> {
    return await this.prismaService.apiKeys.create({
      data: data,
    });
  }

  async createApiKey(userId: string): Promise<TApiKeyOutput> {
    const env: string = this.config.get('ENVIRONMENT_TYPE');
    const keyHash = randomBytes(8).toString('hex');
    const apiKey = `ce_${env}_${keyHash}`;

    const data: TApiKeyCreateInput = {
      apiKey: apiKey,
      user: { connect: { id: userId } },
    };

    return await this.createApiKeyRecord(data);
  }
}
