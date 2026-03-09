import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomLogger } from '../../logger/custom-logger.service';

@Injectable()
export class CorporateRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
    private readonly logger: CustomLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('pjroles', context.getHandler());

    if (!roles) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userInfo = user.userInfo;

    let requestId = request.user.requestId;

    if (!requestId) {
      requestId = 'NOT FOUND';
    }

    let pjId: string;
    try {
      pjId = request.params.pjId;
    } catch {
      this.logger.info({ message: 'RequestId not found', context: CorporateRolesGuard.name });
      return false;
    }

    if (!userInfo.id) {
      this.logger.info({ message: 'User Id not found', context: CorporateRolesGuard.name });
      return false;
    }

    const userRole = await this.prismaService.corporateAdmins.findFirst({
      where: { AND: [{ pf: { userId: userInfo.id } }, { idPJ: pjId }] },
    });

    if (!userRole) {
      this.logger.info({ message: 'UserRole not found', context: CorporateRolesGuard.name });
      return false;
    }

    if (this.matchRoles(roles, userRole.role)) {
      request.user.userInfo = await this.prismaService.user.findFirst({ where: { pessoaJuridica: { idPJ: pjId } } });
      this.logger.info({ message: 'Verification Succeded', context: CorporateRolesGuard.name });
      return true;
    } else {
      this.logger.info({ message: 'Verification Failed', context: CorporateRolesGuard.name });
      return false;
    }
  }

  matchRoles(roles: string[], userRole: string): boolean {
    const requiredRole = roles[0];

    const educationalRoles = {
      admin: 3,
      medio: 2,
      basico: 1,
    };

    if (educationalRoles[requiredRole] <= educationalRoles[userRole]) return true;
    return false;
  }
}
