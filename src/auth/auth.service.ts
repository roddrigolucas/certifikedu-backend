import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TUserOutput, TUserPfAndPjOutput, TUserPfOutput, TUserPjOutput } from '../users/types/user.types';
import { TUserCreateInput } from './types/auth.types';
import { CognitoService } from '../aws/cognito/cognito.service';
import { TemplatesService } from '../templates/templates.service';
import { AuxService } from '../_aux/_aux.service';
import { CertificatesService } from '../certificates/certificates.service';
import { IAdminCreateUserCognito, IRegisterOnPoolCognitoRequest } from '../aws/cognito/interfaces/cognito.interfaces';
import { IResponseUsersRawInfo } from './interfaces/auth.interfaces';
import { SESService } from '../aws/ses/ses.service';
import { PaymentsService } from '../payments/services/payments.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cognitoService: CognitoService,
    private readonly templatesService: TemplatesService,
    private readonly auxService: AuxService,
    private readonly certificatesService: CertificatesService,
    private readonly paymentsService: PaymentsService,
    private readonly sesService: SESService,
  ) { }

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

    const cognito = await this.cognitoService.checkUserCognito(email);

    if (cognito?.Users && cognito?.Users.length > 0) {
      await this.cognitoService.deleteUserCognito(email);
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

  async signUpPjUser(data: TUserCreateInput, password: string): Promise<TUserPjOutput> {
    const signUpCognitoDto: IRegisterOnPoolCognitoRequest = {
      email: data.email,
      password: password,
      phoneNumber: '+55' + data.pessoaJuridica.create.telefone,
      docNumber: data.numeroDocumento,
    };

    await this.cognitoService.registerNewUserOnPoolCognito(signUpCognitoDto, 'PJ');

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
    const session = await this.prismaService.session.findUnique({
      where: { token },
    });

    if (!session || !session.isActive) {
      return { success: true };
    }

    const now = new Date();
    // Calculate final duration: time difference from lastActivityAt
    const timeSinceLastActivity = Math.floor((now.getTime() - session.lastActivityAt.getTime()) / 1000);
    const newDurationSeconds = session.durationSeconds + timeSinceLastActivity;

    await this.prismaService.session.update({
      where: { token },
      data: {
        isActive: false,
        logoutAt: now,
        durationSeconds: newDurationSeconds,
      },
    });

    return { success: true };
  }

  async signUpPfUser(data: TUserCreateInput, password: string): Promise<TUserPfOutput> {
    const signUpCognitoDto: IRegisterOnPoolCognitoRequest = {
      email: data.email,
      password: password,
      phoneNumber: '+55' + data.pessoaFisica.create.telefone,
      docNumber: data.numeroDocumento,
    };

    await this.cognitoService.registerNewUserOnPoolCognito(signUpCognitoDto, 'PF');

    const user = await this.createUserPfRecord(data);

    await this.certificatesService.addUserCertificates(user.id, user.numeroDocumento, user.pessoaFisica.nome);

    await this.templatesService.createWelcomeTemplateCertificate(user, user.pessoaFisica.nome);

    await this.paymentsService.addNewUserToPaymentsInfra(user);

    this.sesService.sendRawEmail(user.pessoaFisica.nome, user.email, user.pessoaFisica.telefone)

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

    const password = this.auxService.generateRandomPassword();

    const cognitoData: IAdminCreateUserCognito = {
      email: data.email,
      userType: 'PF',
      password: password,
    };

    const cognito = await this.cognitoService.checkUserCognito(data.email);

    if (cognito?.Users && cognito?.Users.length > 0) {
      await this.cognitoService.deleteUserCognito(data.email);
    }

    this.cognitoService.adminCreateNewUserCognito(cognitoData);

    const userName = data?.tempName ?? '';

    this.sesService.sendNewUserPassword(data.email, password, userName);

    const user = await this.createRawUserRecord(data);

    this.certificatesService.addUserCertificates(user.id, user.numeroDocumento, userName);

    this.templatesService.createWelcomeTemplateCertificate(user, user.tempName ?? '');

    this.paymentsService.createRawUserSubscription(user.id);

    this.sesService.sendRawEmail(user?.tempName ?? "nao informado", user.email)

    return responseDict;
  }

  async resetRawUserPassword(email: string): Promise<{ hasAccount: boolean; isRaw: boolean }> {
    const response = { hasAccount: false, isRaw: false };

    const listUsersResponse = await this.cognitoService.listCognitoUserByEmail(email);

    if (!listUsersResponse.Users || listUsersResponse.Users.length === 0) {
      return response;
    }

    const user = await this.cognitoService.getUserCognito(listUsersResponse.Users[0].Username);

    if (!user) {
      return response;
    }

    const cognitoStatus = {
      status: user.Enabled,
      userStatus: user.UserStatus,
      emailStatus: user.UserAttributes?.find((attr) => attr.Name === 'email_verified')?.Value ?? 'false',
    };

    const userInfo = await this.getUserByEmail(email);

    if (!userInfo) {
      return response;
    }

    response.hasAccount = true;

    if (
      (userInfo.pessoaFisica || userInfo.pessoaJuridica) &&
      cognitoStatus.status === true &&
      cognitoStatus.emailStatus !== 'false' &&
      cognitoStatus.userStatus === 'CONFIRMED'
    ) {
      return response;
    }

    response.isRaw = true;

    const password = this.auxService.generateRandomPassword();

    await this.cognitoService.resetUserPasswordCognito(email, password);

    await this.sesService.sendNewUserPassword(email, password, userInfo?.tempName ?? '');

    return response;
  }
}
