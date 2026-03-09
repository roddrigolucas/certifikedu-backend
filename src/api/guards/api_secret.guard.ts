import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomLogger } from '../../logger/custom-logger.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService, private readonly logger: CustomLogger) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['ce-api-key'];

    if (!apiKey) {
      this.logger.info({
        message: `API Key verification - Key not in request`,
        context: ApiKeyGuard.name,
      });
      return false
    }

    const key = await this.prismaService.apiKeys.findUnique({ where: { apiKey: apiKey } });

    if (!key) {
      this.logger.info({
        message: `API Key verification - Key not found`,
        context: ApiKeyGuard.name,
      });

      return false;
    }

    if (key.isDeleted === true) {
      this.logger.info({
        message: `API Key verification -- Key Deleted`,
        context: ApiKeyGuard.name,
      });
      return false;
    }

    const user = await this.prismaService.user.findUnique({ where: { id: key.userId } });

    if (!user) {
      this.logger.info({
        message: `API Key verification - Key Verified - User not found`,
        context: ApiKeyGuard.name,
      });
      return false;
    }

    request.user = {
      userInfo: user,
    };

    this.logger.info({
      message: `API Key verification - Key Verified`,
      context: ApiKeyGuard.name,
    });

    return true;
  }
}
