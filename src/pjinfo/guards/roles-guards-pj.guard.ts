import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomLogger } from '../../logger/custom-logger.service';

@Injectable()
export class PJRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
    private readonly logger: CustomLogger,
  ) { }

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
      return false;
    }

    if (!userInfo.id) {
      return false;
    }

    const userRole = await this.prismaService.pJAdmins.findFirst({
      where: { AND: [{ pf: { userId: userInfo.id } }, { idPJ: pjId }] },
    });

    if (!userRole) {
      return false;
    }

    if (this.matchRoles(roles, userRole.role)) {
      const idPF = request.user.idPF ? request.user.idPF : null;
      const pjInfo = await this.prismaService.user.findFirst({ where: { pessoaJuridica: { idPJ: pjId } } });
      request.user.userInfo = { idPF, ...pjInfo };

      this.logger.info({ message: 'Verification Succeded', context: PJRolesGuard.name });
      return true;
    } else {
      this.logger.info({ message: 'Verification Failed', context: PJRolesGuard.name });
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
