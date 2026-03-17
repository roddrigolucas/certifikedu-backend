import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IAdminCreateUserCognito,
  IAuthenticateCognitoRequest,
  IRegisterOnPoolCognitoRequest,
} from './interfaces/cognito.interfaces';

@Injectable()
export class CognitoService {
  private readonly jwtSecret: string;
  private readonly jwtExpiration: string;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {
    this.jwtSecret = this.configService.getOrThrow('JWT_SECRET');
    this.jwtExpiration = this.configService.get('JWT_EXPIRATION') || '7d';
  }

  async registerNewUserOnPoolCognito(authRegisterRequest: IRegisterOnPoolCognitoRequest, user_type: string) {
    const { email, password } = authRegisterRequest;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Store credentials in the local auth_credentials table
    await this.prismaService.$executeRawUnsafe(
      `INSERT INTO auth_credentials (email, password_hash, user_type, status) VALUES ($1, $2, $3, 'CONFIRMED') ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      email,
      hashedPassword,
      user_type,
    );

    return { email };
  }

  async adminCreateNewUserCognito(data: IAdminCreateUserCognito) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.prismaService.$executeRawUnsafe(
      `INSERT INTO auth_credentials (email, password_hash, user_type, status) VALUES ($1, $2, $3, 'FORCE_CHANGE_PASSWORD') ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      data.email,
      hashedPassword,
      data.userType,
    );

    return { User: { Username: data.email } };
  }

  async authenticateCognito(data: IAuthenticateCognitoRequest): Promise<{ access_token: string }> {
    const result = await this.prismaService.$queryRawUnsafe<any[]>(
      `SELECT * FROM auth_credentials WHERE email = $1`,
      data.email,
    );

    if (!result || result.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const credentials = result[0];
    const isValid = await bcrypt.compare(data.password, credentials.password_hash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const user = await this.prismaService.user.findUnique({ where: { email: data.email } });

    const payload = {
      email: data.email,
      sub: user?.id || credentials.email,
      'custom:user_type': credentials.user_type,
      'custom:id': user?.id,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiration,
    });

    if (user?.id) {
      await this.prismaService.session.create({
        data: {
          userId: user.id,
          token: access_token,
          isActive: true,
        },
      });
    }

    return { access_token };
  }

  async listCognitoUserByEmail(email: string) {
    const result = await this.prismaService.$queryRawUnsafe<any[]>(
      `SELECT * FROM auth_credentials WHERE email = $1`,
      email,
    );

    return {
      Users: result.map((r) => ({
        Username: r.email,
        Enabled: true,
        UserStatus: r.status,
        Attributes: [
          { Name: 'email', Value: r.email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'custom:user_type', Value: r.user_type },
        ],
      })),
    };
  }

  async getUserCognito(username: string) {
    const result = await this.prismaService.$queryRawUnsafe<any[]>(
      `SELECT * FROM auth_credentials WHERE email = $1`,
      username,
    );

    if (!result || result.length === 0) return null;

    const r = result[0];
    return {
      Username: r.email,
      Enabled: true,
      UserStatus: r.status,
      UserAttributes: [
        { Name: 'email', Value: r.email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'custom:user_type', Value: r.user_type },
      ],
    };
  }

  async resetUserPasswordCognito(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prismaService.$executeRawUnsafe(
      `UPDATE auth_credentials SET password_hash = $1, status = 'FORCE_CHANGE_PASSWORD' WHERE email = $2`,
      hashedPassword,
      email,
    );

    return {};
  }

  async addUserIdAttributeCognito(email: string, userId: string) {
    // No-op in local mode; user ID is already in PostgreSQL
    return {};
  }

  async deleteUserCognito(email: string) {
    await this.prismaService.$executeRawUnsafe(
      `DELETE FROM auth_credentials WHERE email = $1`,
      email,
    );

    return {};
  }

  async checkUserCognito(email: string) {
    return this.listCognitoUserByEmail(email);
  }
}
