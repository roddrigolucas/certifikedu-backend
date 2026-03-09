import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as jwktopem from 'jwk-to-pem';
import { CustomLogger } from '../../../../logger/custom-logger.service';

@Injectable()
export class LTIAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
    private logger: CustomLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromBody(request);
    if (!token) {
      throw new UnauthorizedException('Token not found in request body');
    }

    const canvasPublicJwkResponse = await this.httpService.axiosRef.get(
      this.configService.getOrThrow('CANVAS_PUBLIC_JWK_URL'),
    );

    const decodedToken = this.jwtService.decode(token, { complete: true }) as any;
    const kid = decodedToken.header.kid;
    const jwk = canvasPublicJwkResponse.data.keys.find((key) => key.kid === kid);

    if (!jwk) {
      throw new UnauthorizedException('JWK not found for the given kid');
    }

    const publicKey = jwktopem(jwk);
    try {
      const ltiLaunchInfo = await this.jwtService.verifyAsync(token, {
        publicKey,
        algorithms: ['RS256'],
      });
      request['ltiLaunchInfo'] = ltiLaunchInfo;
    } catch (error) {
      this.logger.error({
        message: 'JWT Verification failed',
        context: LTIAuthGuard.name,
        error,
      });
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromBody(request: Request): string | undefined {
    return request.body?.id_token;
  }
}
