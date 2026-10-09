import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as jwktopem from 'jwk-to-pem';
import { CustomLogger } from '../../../../logger/custom-logger.service';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class MoodleLTIAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private prismaService: PrismaService,
    private logger: CustomLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.body?.id_token;
    if (!token) {
      throw new UnauthorizedException('Token not found in request body');
    }

    // Decode without verifying to get the issuer and kid
    const decodedToken = this.jwtService.decode(token, { complete: true }) as any;
    if (!decodedToken) {
      throw new UnauthorizedException('Malformed token');
    }

    const { kid } = decodedToken.header;
    const iss = decodedToken.payload.iss;
    const aud = decodedToken.payload.aud; // Array or string

    const clientId = Array.isArray(aud) ? aud[0] : aud;

    if (!iss || !clientId) {
      throw new UnauthorizedException('Missing issuer or audience in token');
    }

    // Fetch config
    const config = await this.prismaService.moodleLtiConfiguration.findUnique({
      where: {
        issuer_clientId: {
          issuer: iss,
          clientId: clientId,
        },
      },
    });

    if (!config) {
      throw new UnauthorizedException('Unrecognized issuer or clientId');
    }

    // Fetch Moodle's public JWK
    try {
      const jwkResponse = await this.httpService.axiosRef.get(config.jwksUrl);
      const jwk = jwkResponse.data.keys.find((key: any) => key.kid === kid);

      if (!jwk) {
        throw new UnauthorizedException('JWK not found for the given kid');
      }

      const publicKey = jwktopem(jwk);
      const ltiLaunchInfo = await this.jwtService.verifyAsync(token, {
        publicKey,
        algorithms: ['RS256'],
        audience: clientId,
        issuer: iss,
      });

      request['ltiLaunchInfo'] = ltiLaunchInfo;
      request['moodleConfig'] = config; // Pass config along
      return true;
    } catch (error) {
      this.logger.error({
        message: 'Moodle JWT Verification failed',
        context: MoodleLTIAuthGuard.name,
        error,
      });
      throw new UnauthorizedException('Invalid token signature or unable to fetch JWK');
    }
  }
}
