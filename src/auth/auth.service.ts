import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TUserOutput, TUserPfAndPjOutput, TUserPfOutput, TUserPjOutput } from '../users/types/user.types';
import { TUserCreateInput } from './types/auth.types';
import { TemplatesService } from '../templates/templates.service';
import { AuxService } from '../_aux/_aux.service';
import { CertificatesService } from '../certificates/certificates.service';
import { IResponseUsersRawInfo } from './interfaces/auth.interfaces';
import { SESService } from '../aws/ses/ses.service';
import { PaymentsService } from '../payments/services/payments.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthenticateRequestDto } from './dto/auth-input.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly templatesService: TemplatesService,
    private readonly auxService: AuxService,
    private readonly certificatesService: CertificatesService,
    private readonly paymentsService: PaymentsService,
    private readonly sesService: SESService,
    private readonly jwtService: JwtService,
  ) {}

  async checkDocumentNumber(userDocument: string): Promise<TUserOutput> {
    return await this.prismaService.user.findUnique({ where: { numeroDocumento: userDocument } });
  }

  async checkEmail(email: string): Promise<TUserOutput> {
    return await this.prismaService.user.findUnique({ where: { email: email } });
  }

  private getDocumentErrorMessage(doc: string): string {
    return `Esse email ja esta cadastrado com o numero de documento ${doc.substring(0, 3)}********.`;
  }

  private getEmailErrorMessage(email: string): string {
    return `Numero de documento ja esta cadastrado para o email ${email.substring(0, 3)}****@${email.split('@')[1]}.`;
  }

  async checkUser(userDocument: string, email: string): Promise<{ exist: boolean; errorMessage?: string }> {
    const checkUserDocument = await this.checkDocumentNumber(userDocument);
    if (checkUserDocument) {
      return { exist: true, errorMessage: this.getEmailErrorMessage(checkUserDocument.email) };
    }

    const checkUserEmail = await this.checkEmail(email);
    if (checkUserEmail) {
      return { exist: true, errorMessage: this.getDocumentErrorMessage(checkUserEmail.numeroDocumento) };
    }

    return { exist: false };
  }

  async getUserByEmail(email: string): Promise<TUserPfAndPjOutput> {
    return await this.prismaService.user.findUnique({
      where: { email: email },
      include: { pessoaFisica: true, pessoaJuridica: true },
    });
  }

  async createUserPfRecord(data: TUserCreateInput): Promise<TUserPfOutput> {
    return await this.prismaService.user.create({
      data: data,
      include: { pessoaFisica: true },
    });
  }

  async createRawUserRecord(data: TUserCreateInput): Promise<TUserOutput> {
    return await this.prismaService.user.create({
      data: data,
    });
  }

  async createUserPjRecord(data: TUserCreateInput): Promise<TUserPjOutput> {
    return await this.prismaService.user.create({
      data: data,
      include: { pessoaJuridica: true },
    });
  }

  async createAuthCredentials(email: string, passwordString: string, type: string) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(passwordString, salt);
    await this.prismaService.authCredentials.upsert({
      where: { email },
      update: { password_hash: hash, status: 'CONFIRMED', user_type: type },
      create: { email, password_hash: hash, status: 'CONFIRMED', user_type: type },
    });
  }

  async signUpPjUser(data: TUserCreateInput, passwordString: string): Promise<TUserPjOutput> {
    await this.createAuthCredentials(data.email, passwordString, 'PJ');
    return this.createUserPjRecord(data);
  }

  async signUpPfUserWithoutCognito(data: TUserCreateInput) {
    const user = await this.createUserPfRecord(data);
    const userName = user.tempName ?? '';
    await this.certificatesService.addUserCertificates(user.id, user.numeroDocumento, userName);
    await this.templatesService.createWelcomeTemplateCertificate(user, userName);
    await this.paymentsService.createRawUserSubscription(user.id);
  }

  async logoutSession(token: string): Promise<{ success: boolean }> {
    const session = await this.prismaService.session.findUnique({ where: { token } });
    if (!session || !session.isActive) return { success: true };

    const now = new Date();
    const timeSinceLastActivity = Math.floor((now.getTime() - session.lastActivityAt.getTime()) / 1000);
    const newDurationSeconds = session.durationSeconds + timeSinceLastActivity;

    await this.prismaService.session.update({
      where: { token },
      data: { isActive: false, logoutAt: now, durationSeconds: newDurationSeconds },
    });
    return { success: true };
  }

  async signUpPfUser(data: TUserCreateInput, passwordString: string): Promise<TUserPfOutput> {
    await this.createAuthCredentials(data.email, passwordString, 'PF');
    const user = await this.createUserPfRecord(data);
    await this.certificatesService.addUserCertificates(user.id, user.numeroDocumento, user.pessoaFisica.nome);
    await this.templatesService.createWelcomeTemplateCertificate(user, user.pessoaFisica.nome);
    await this.paymentsService.addNewUserToPaymentsInfra(user);
    this.sesService.sendRawEmail(user.pessoaFisica.nome, user.email, user.pessoaFisica.telefone);
    return user;
  }

  async signUpRawUser(data: TUserCreateInput, responseDict: IResponseUsersRawInfo): Promise<IResponseUsersRawInfo> {
    const checkUserDocument = await this.checkDocumentNumber(data.numeroDocumento);
    if (checkUserDocument) {
      responseDict.error = this.getEmailErrorMessage(checkUserDocument.email);
      responseDict.isValid = false;
      return responseDict;
    }

    const checkUserEmail = await this.checkEmail(data.email);
    if (checkUserEmail) {
      responseDict.error = this.getDocumentErrorMessage(checkUserEmail.numeroDocumento);
      responseDict.isValid = false;
      return responseDict;
    }

    const passwordString = this.auxService.generateRandomPassword();
    await this.createAuthCredentials(data.email, passwordString, 'PF');

    const userName = data?.tempName ?? '';
    this.sesService.sendNewUserPassword(data.email, passwordString, userName);

    const user = await this.createRawUserRecord(data);
    this.certificatesService.addUserCertificates(user.id, user.numeroDocumento, userName);
    this.templatesService.createWelcomeTemplateCertificate(user, user.tempName ?? '');
    this.paymentsService.createRawUserSubscription(user.id);
    this.sesService.sendRawEmail(user?.tempName ?? "nao informado", user.email);

    return responseDict;
  }

  async resetRawUserPassword(email: string): Promise<{ hasAccount: boolean; isRaw: boolean }> {
    const response = { hasAccount: false, isRaw: false };
    const authRecord = await this.prismaService.authCredentials.findUnique({ where: { email } });
    if (!authRecord) return response;

    const userInfo = await this.getUserByEmail(email);
    if (!userInfo) return response;

    response.hasAccount = true;
    if ((userInfo.pessoaFisica || userInfo.pessoaJuridica) && authRecord.status === 'CONFIRMED') {
      return response;
    }

    response.isRaw = true;
    const passwordString = this.auxService.generateRandomPassword();
    await this.createAuthCredentials(email, passwordString, 'PF');
    await this.sesService.sendNewUserPassword(email, passwordString, userInfo?.tempName ?? '');

    return response;
  }

  async login(dto: AuthenticateRequestDto): Promise<{ accessToken: string, refreshToken: string, user: any }> {
    const { email, password } = dto;
    const authRecord = await this.prismaService.authCredentials.findUnique({ where: { email } });
    if (!authRecord) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const isMatch = await bcrypt.compare(password, authRecord.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET || 'secretKey', expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey', expiresIn: '7d' });

    return { accessToken, refreshToken, user };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string, newRefreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey' });
      const newPayload = { email: payload.email, sub: payload.sub };
      const accessToken = this.jwtService.sign(newPayload, { secret: process.env.JWT_SECRET || 'secretKey', expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newPayload, { secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey', expiresIn: '7d' });
      return { accessToken, newRefreshToken };
    } catch (e) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }
}
