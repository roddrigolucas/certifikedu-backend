import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { DateFormat } from '../../interceptors/dateformat.interceptor';
import { GetUser } from '../../auth/decorators';
import { CredentialsService } from '../../credentials-api/credentials.service';
import { ResponseKeyInfoAPIDto } from '../dtos/credentials/credentials-response.dto';

@ApiTags('API Credentials')
@Controller('api/v1')
@UseGuards(JwtGuard)
export class CredentialsAPIController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Roles('enabled')
  @UseGuards(RolesGuard)
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Post('/create/key')
  async createApiKey(@GetUser() user: User): Promise<ResponseKeyInfoAPIDto> {
    if (user.type !== 'PJ') {
      throw new ForbiddenException('This user is not PJ therefore cannot create a key.');
    }
    if (!user.apiEnabled) {
      throw new ForbiddenException('This user is not enabled to create a key.');
    }

    const existingKey = await this.credentialsService.getUserValidKey(user.id);

    if (existingKey) {
      throw new BadRequestException('This user already has an active key.');
    }

    const key = await this.credentialsService.createApiKey(user.id);

    return {
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
      apiKey: key.apiKey,
    };
  }

  @Roles('enabled')
  @UseGuards(RolesGuard)
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Get('user/key')
  async getUserActiveKeys(@GetUser('id') userId: string): Promise<ResponseKeyInfoAPIDto> {
    const key = await this.credentialsService.getUserValidKey(userId);

    if (!key) {
      throw new NotFoundException('Key not Found.');
    }

    return {
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
      apiKey: key.apiKey,
    };
  }

  @Roles('enabled')
  @UseGuards(RolesGuard)
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Get('user/key')
  async deleteUserActiveKey(@GetUser('id') userId: string): Promise<{ success: boolean }> {
    const key = await this.credentialsService.getUserValidKey(userId);

    if (!key) {
      throw new NotFoundException('Key not Found.');
    }

    await this.credentialsService.deleteUserKey(key.apiKeyId);

    return { success: true };
  }
}
