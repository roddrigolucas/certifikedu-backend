import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { CustomLogger } from '../../logger/custom-logger.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly logger: CustomLogger,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async getUserInfoFromCognito(emailCognito: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email: emailCognito },
      include: { pessoaFisica: { select: { idPF: true } } },
    });
    return user;
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const session = await this.prismaService.session.findUnique({
        where: { token },
      });

      if (!session || !session.isActive) {
        throw new UnauthorizedException('Sessão expirada ou inválida. Faça login novamente.');
      }
    }

    const userData = await this.getUserInfoFromCognito(payload.email);

    if (!userData) {
      return new NotFoundException('User is authenticated but is missing in the database');
    }

    this.logger.info({
      message: 'Completed Token Verification',
      context: JwtStrategy.name,
      cognito_payload: payload,
      userEmail: userData.email,
      userStatus: userData.status,
    });

    const session = {
      userInfo: userData,
      idPF: userData?.pessoaFisica?.idPF,
    };

    return session;
  }
}
