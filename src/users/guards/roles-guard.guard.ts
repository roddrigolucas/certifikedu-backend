import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomLogger } from '../../logger/custom-logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, 
    private readonly logger: CustomLogger) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userInfo) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const userInfo = user.userInfo;

    const response = this.matchRoles(roles, userInfo.status);

    if (response) {
      this.logger.info({
        context: RolesGuard.name,
        message: 'Role verification Succeded',
        allowed_role: roles[0],
        userEmail: userInfo.email,
        userStatus: userInfo.status,
      });
    }

    return response;
  }

  matchRoles(roles: string[], userStatus: string): boolean {
    if (roles[0] === 'admin' && userStatus === 'ADMIN') return true;
    else if (roles[0] === 'enabled' && (userStatus === 'ADMIN' || userStatus === 'ENABLED')) return true;
    else if (roles[0] === 'review' && userStatus !== 'DISABLED') return true;
    else return false;
  }
}
