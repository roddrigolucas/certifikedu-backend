import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomLogger } from '../../../logger/custom-logger.service';
import { ICanvasUserData } from '../interfaces/canvas-platform.interfaces';

@Injectable()
export class CanvasRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly logger: CustomLogger) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('canvasRoles', context.getHandler());

    if (!roles) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userInfo) {
      this.logger.warn({
        message: 'Role verification - User not in session',
        context: CanvasRolesGuard.name,
      });

      throw new ForbiddenException('Forbidden Resource');
    }

    const userInfo: ICanvasUserData = user.userInfo;

    this.logger.info({
      context: CanvasRolesGuard.name,
      message: `Canvas Role verification`,
      allowed_role: roles[0],
      userEmail: userInfo.email,
    });

    const response = this.matchRoles(roles, userInfo);

    if (response) {
      this.logger.info({
        context: CanvasRolesGuard.name,
        message: 'Canvas Role verification Succeded',
        allowed_role: roles[0],
        userEmail: userInfo.email,
      });
    }

    return response;
  }

  matchRoles(roles: string[], userInfo: ICanvasUserData): boolean {
    if (roles[0] === 'teacher' && !userInfo) {
      this.logger.info({
        context: CanvasRolesGuard.name,
        message: 'Canvas Role verification Failed',
        allowed_role: roles[0],
        userEmail: userInfo.email,
      });

      return false;
    }

    return true;
  }
}
