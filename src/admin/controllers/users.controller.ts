import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { JwtGuard } from '../../auth/guard';
import { AuxService } from '../../common/common.service';
import { CognitoService } from '../../aws/cognito/cognito.service';
import { S3Service } from '../../aws/s3/s3.service';
import { SESService } from '../../aws/ses/ses.service';
import { CertificatesService } from '../../certificates/certificates.service';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { TPessoaFisicaUpdateInput, TPessoaJuridicaUpdateInput } from '../../users/types/user.types';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../../auth/auth.service';
import { PaymentsService } from '../../payments/services/payments.service';
import {
  TPessoaFisicaCreateWoUserInput,
  TPessoaJuridicaCreateWoUserInput,
  TSocioCreateWoPjInput,
  TUserCreateInput,
} from '../../auth/types/auth.types';
import {
  AdminCreateUserDto,
  AdminUpdatePfInfoDto,
  AdminUpdatePjInfoDto,
  UpdateUserDocumentPictureStatusAdminParamDto,
  UpdateUserStatusAdminParamDto,
} from '../dtos/users/user-input.dto';
import {
  ResponsePfUserInfoAdminDto,
  ResponsePjUserInfoAdminDto,
  ResponseUserInfoAdminDto,
  ResponseUsersAdminDto,
} from '../dtos/users/user-response.dto';
import { AuditService } from 'src/audit/audit.service';
import { PJRoles } from 'src/pjinfo/decorators/roles-pj.decorator';

@ApiTags('ADMIN -- Users')
@Controller('admin/users')
@UseGuards(JwtGuard, RolesGuard)
export class UsersAdminController {
  constructor(
    private readonly certificateService: CertificatesService,
    private readonly userService: UsersService,
    private readonly auditService: AuditService,
    private readonly auxService: AuxService,
    private readonly sesService: SESService,
    private readonly s3Service: S3Service,
    private readonly cognitoService: CognitoService,
    private readonly authService: AuthService,
    private readonly paymentsService: PaymentsService,
  ) { }

  @Roles('admin')
  @Post()
  async adminCreateUser(@Body() dto: AdminCreateUserDto): Promise<{ success: boolean; user: any }> {
    const cleanEmail = dto.email.trim().toLowerCase();
    const cleanDoc = dto.documentNumber.replace(/\D/g, '') || dto.documentNumber.trim();

    const checkUser = await this.authService.checkUser(cleanDoc, cleanEmail);
    if (checkUser.exist) {
      throw new BadRequestException(checkUser.errorMessage);
    }

    const passwordString = dto.password?.trim() || this.auxService.generateRandomPassword();
    const type = dto.type || (cleanDoc.length > 11 ? 'PJ' : 'PF');
    const status = dto.status || UserStatus.ENABLED;

    let createdUser: any;

    if (type === 'PJ') {
      const socio: TSocioCreateWoPjInput = {
        CPF: '00000000000',
        nome: dto.name,
        telefone: dto.phone || '',
        dataDeNascimento: '1990-01-01T00:00:00.000Z',
        cepNumber: '00000000',
        estado: 'UF',
        cidade: 'Cidade',
        bairro: 'Bairro',
        rua: 'Rua',
        numero: '0',
        complemento: '',
      };

      const pj: TPessoaJuridicaCreateWoUserInput = {
        razaoSocial: dto.name,
        nomeFantasia: dto.name,
        telefone: dto.phone || '',
        dataDeFundacao: '2020-01-01T00:00:00.000Z',
        segmento: 'Geral',
        numeroDeFuncionarios: 10,
        socios: { create: socio },
      };

      const userData: TUserCreateInput = {
        numeroDocumento: cleanDoc,
        email: cleanEmail,
        type: 'PJ',
        status: status,
        pessoaJuridica: { create: pj },
      };

      await this.authService.createAuthCredentials(cleanEmail, passwordString, 'PJ');
      createdUser = await this.authService.createUserPjRecord(userData);
      await this.paymentsService.createRawUserSubscription(createdUser.id);
    } else {
      const pf: TPessoaFisicaCreateWoUserInput = {
        nome: dto.name,
        telefone: dto.phone || '',
        dataDeNascimento: '1990-01-01T00:00:00.000Z',
        cepNumber: '00000000',
        estado: 'UF',
        cidade: 'Cidade',
        bairro: 'Bairro',
        rua: 'Rua',
        numero: '0',
        complemento: '',
      };

      const userData: TUserCreateInput = {
        numeroDocumento: cleanDoc,
        email: cleanEmail,
        type: 'PF',
        status: status,
        pessoaFisica: { create: pf },
      };

      await this.authService.createAuthCredentials(cleanEmail, passwordString, 'PF');
      createdUser = await this.authService.createUserPfRecord(userData);
      if (status === UserStatus.ENABLED) {
        await this.certificateService.addUserCertificates(createdUser.id, cleanDoc, dto.name);
      }
      await this.paymentsService.addNewUserToPaymentsInfra(createdUser);
    }

    return { success: true, user: createdUser };
  }


  @Roles('enabled')
  @PJRoles('medio')
  @Get('compliance/:pjId')
  async getAuditLogs(@Param('pjId') pjId: string) {
    const logs = await this.auditService.getLogsByPjId(pjId);
    console.log("AUDIT")
    return {
      logs: logs.map((log) => {
        return {
          id: log.id,
          action: log.action,
          description: log.description,
          targetEntity: log.targetEntity,
          targetId: log.targetId,
          createdAt: log.createdAt,

          actorEmail: log.actor?.email ?? 'Sistema',
          actorType: log.actor?.type ?? 'N/A',
          metadata: log.metadata,
        };
      }),
    };
  }

  // TODO - Pagination
  @Roles('admin')
  @Get('compliance')
  async getAllAuditLogs() {
    const logs = await this.auditService.getAllLogs();

    return {
      logs: logs.map((log) => {
        return {
          id: log.id,
          action: log.action,
          description: log.description,
          targetEntity: log.targetEntity,
          targetId: log.targetId,
          createdAt: log.createdAt,
          // Mapeando os dados do actor que vieram do include
          actorEmail: log.actor?.email ?? 'Sistema',
          actorType: log.actor?.type ?? 'N/A',
          metadata: log.metadata,
        };
      }),
    };
  }

  @Roles('admin')
  @Get(':status')
  async getUsersByStatus(@Param('status') status: UserStatus): Promise<ResponseUsersAdminDto> {
    const users = await this.userService.getUsersByStatus(status);

    return {
      users: users.map((user) => {
        return {
          userId: user.id,
          name: user?.pessoaFisica?.nome ?? user.pessoaJuridica?.nomeFantasia ?? '',
          email: user.email,
          phone: user?.pessoaFisica?.telefone ?? user.tempPhone ?? '',
          document: user.numeroDocumento,
          type: user.type,
          status: user.status,
          freeCertificates: user.freeCertificates,
          pictureId: user.document?.at(0)?.documentId ?? null,
          apiEnabled: user.apiEnabled,
          //documentPictures: user.document.map((docPicture) => {
          //  return {
          //    pictureId: docPicture.documentId,
          //    pictureStatus: docPicture.status,
          //  };
          //}),
        };
      }),
    };
  }


  @Roles('admin')
  @Get(':userId')
  async adminGetUserInfo(@Param('userId') userId: string): Promise<ResponseUserInfoAdminDto> {
    const user = await this.userService.getUserWithPfAndPjById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userCertificates = await this.certificateService.getUserCertificatesAdminByUserDocument(user.numeroDocumento);

    const userInfo: ResponseUserInfoAdminDto = {
      userId: user.id,
      name: user.tempName ?? null,
      email: user.email,
      phone: user.tempPhone ?? null,
      type: user.type,
      status: user.status,
      isRaw: true,
      certificates: userCertificates.map((certificate) => {
        return {
          certificateId: certificate.certificateId,
          receptorDoc: certificate.receptorDoc,
          name: certificate.name,
          createdAt: certificate.createdAt,
          description: certificate.description,
          hoursWorkload: certificate.cargaHoraria,
          receptorName: certificate.receptorName,
          issuerName: certificate.emissorName,
          abilities: certificate.habilidades.map((ability) => {
            return {
              abilityId: ability.habilidade.habilidadeId,
              ability: ability.habilidade.habilidade,
              category: ability.habilidade.tema,
            };
          }),
          blockchain: certificate.blockchain,
          openBadge: certificate.openBadge,
          issuedAt: certificate?.issuedAt ?? null,
          expiresAt: certificate?.expiresAt ?? null,
          status: certificate.status,
          statusRequest: certificate.statusRequest,
          certificateHash: certificate.hashes[0].hashId,
        };
      }),
      documentPictures: [],
    };

    if (user?.pessoaJuridica) {
      const pj = user.pessoaJuridica;
      userInfo.isRaw = false;
      userInfo.name = pj.nomeFantasia;
      userInfo.phone = pj.telefone;
      userInfo.pj = {
        phone: pj.telefone,
        companyName: pj.razaoSocial,
        fantasyName: pj.nomeFantasia,
        dateCreation: pj.dataDeFundacao,
        category: pj.segmento,
        partners: pj.socios.map((partner) => {
          return {
            socioId: partner.sociosId,
            phone: partner.telefone,
            name: partner.nome,
            birthdate: partner.dataDeNascimento,
            address: {
              street: partner.rua,
              streetNumber: partner.numero,
              neighborhood: partner.bairro,
              zipCode: partner.cepNumber,
              city: partner.cidade,
              state: partner.estado,
              complementary: partner.complemento,
            },
          };
        }),
      };
    }

    if (user?.pessoaFisica) {
      const pf = user.pessoaFisica;
      userInfo.isRaw = false;
      userInfo.name = pf.nome;
      userInfo.phone = pf.telefone;
      userInfo.pf = {
        name: pf.nome,
        phoneNumber: pf.telefone,
        birthdate: pf.dataDeNascimento,
        address: {
          street: pf.rua,
          streetNumber: pf.numero,
          neighborhood: pf.bairro,
          zipCode: pf.cepNumber,
          city: pf.cidade,
          state: pf.estado,
          complementary: pf.complemento,
        },
      };
      userInfo.documentPictures = user.document.map((picture) => {
        return {
          pictureId: picture.documentId,
          pictureStatus: picture.status,
        };
      });
    }

    return userInfo;
  }

  @Roles('admin')
  @Patch(':userId/status/:status')
  async updateUserStatus(@Param() params: UpdateUserStatusAdminParamDto): Promise<{ success: boolean }> {
    const user = await this.userService.getUserWithPfAndPjById(params.userId);

    if (user?.pessoaFisica && params.status === UserStatus.ENABLED) {
      await this.certificateService.addUserCertificates(user.id, user.numeroDocumento, user.pessoaFisica.nome);
      this.sesService.sendApprovedDocument(user.email, user.pessoaFisica.nome);
    }

    await this.userService.updateUserStatusAdmin(params.userId, params.status);
    return { success: true };
  }

  @Roles('admin')
  @Patch(':userId/reset-password')
  async resetUserPassword(
    @Param('userId') userId: string,
  ): Promise<{ success: boolean; email: string; temporaryPassword: string; emailSent: boolean }> {
    const user = await this.userService.getUserWithPfAndPjById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (!user.email) {
      throw new BadRequestException('Usuário não possui e-mail cadastrado.');
    }

    const passwordString = this.auxService.generateRandomPassword();

    // Upsert: cria as credenciais caso o usuario tenha sido migrado/importado sem registro em AuthCredentials
    try {
      await this.authService.createAuthCredentials(user.email, passwordString, user.type ?? 'PF');
    } catch (err) {
      console.error('[ResetPassword] Falha ao gravar credenciais:', err);
      throw new BadRequestException('Não foi possível gravar a nova senha no banco de dados.');
    }

    // Envio de e-mail nunca deve impedir o reset (SMTP pode estar indisponivel)
    let emailSent = true;
    try {
      const userName = user.pessoaFisica?.nome ?? user.pessoaJuridica?.nomeFantasia ?? user.tempName ?? '';
      await this.sesService.sendNewUserPassword(user.email, passwordString, userName);
    } catch (err) {
      emailSent = false;
      console.error('[ResetPassword] Falha ao enviar e-mail:', err);
    }

    return { success: true, email: user.email, temporaryPassword: passwordString, emailSent };
  }

  @Roles('admin')
  @Patch('pf/:userId')
  async updateUserPfInfo(
    @Param('userId') userId: string,
    @Body() dto: AdminUpdatePfInfoDto,
  ): Promise<ResponsePfUserInfoAdminDto> {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    const pfData: TPessoaFisicaUpdateInput = {
      nome: dto.name,
      telefone: dto.phoneNumber,
      dataDeNascimento: dto.birthdate,
      cepNumber: dto.address.zipCode,
      estado: dto.address.state,
      cidade: dto.address.city,
      bairro: dto.address.neighborhood,
      rua: dto.address.street,
      numero: dto.address.streetNumber,
      complemento: dto.address.complementary,
    };

    const pf = await this.userService.updatePfUserInfoAdmin(userId, pfData);

    return {
      name: pf.nome,
      phoneNumber: pf.telefone,
      birthdate: pf.dataDeNascimento,
      address: {
        street: pf.rua,
        streetNumber: pf.numero,
        neighborhood: pf.bairro,
        zipCode: pf.cepNumber,
        city: pf.cidade,
        state: pf.estado,
        complementary: pf.complemento,
      },
    };
  }

  @Roles('admin')
  @Patch('pj/:userId')
  async updateUserPjInfo(
    @Param('userId') userId: string,
    @Body() dto: AdminUpdatePjInfoDto,
  ): Promise<ResponsePjUserInfoAdminDto> {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    const pjData: TPessoaJuridicaUpdateInput = {
      nomeFantasia: dto.fantasyName,
      razaoSocial: dto.companyName,
      dataDeFundacao: dto.dateCreation,
      segmento: dto.category,
      telefone: dto.phone,
    };

    const pj = await this.userService.updatePjUserInfoAdmin(userId, pjData);

    return {
      phone: pj.telefone,
      companyName: pj.razaoSocial,
      fantasyName: pj.nomeFantasia,
      dateCreation: pj.dataDeFundacao,
      category: pj.segmento,
      partners: pj.socios.map((partner) => {
        return {
          socioId: partner.sociosId,
          phone: partner.telefone,
          name: partner.nome,
          birthdate: partner.dataDeNascimento,
          address: {
            street: partner.rua,
            streetNumber: partner.numero,
            neighborhood: partner.bairro,
            zipCode: partner.cepNumber,
            city: partner.cidade,
            state: partner.estado,
            complementary: partner.complemento,
          },
        };
      }),
    };
  }

  @Roles('admin')
  @Get('check/:email')
  async checkUserCognito(@Param('email') email: string): Promise<{ success: boolean }> {
    const user = await this.userService.getUserById(email);

    if (!user) {
      return { success: false };
    }

    const userCognito = await this.cognitoService.checkUserCognito(email);

    if (userCognito?.Users && userCognito?.Users.length > 0) {
      return { success: false };
    }

    return { success: true };
  }

  @Roles('admin')
  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string): Promise<{ success: boolean }> {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not Found.');
    }

    const userCognito = await this.cognitoService.checkUserCognito(user.email);

    if (userCognito?.Users && userCognito?.Users.length > 0) {
      await this.cognitoService.deleteUserCognito(user.email);
    }

    await this.userService.deleteUser(userId);

    return { success: true };
  }

  @Roles('admin')
  @Get('document/:id')
  async getUserDocPicture(@Param('id') pictureId: string): Promise<{ buffer: string }> {
    const picture = await this.userService.getUserPfDocumentPictureRecordById(pictureId);

    if (!picture) {
      throw new NotFoundException('Picture Not found.');
    }

    const s3Url = this.auxService.getUserDocumentPicturePath(picture.userId, picture.fotoHash, picture.fotoType);

    const pictureReadable = await this.s3Service.getObject(this.auxService.nestBucket, s3Url);

    return { buffer: await this.s3Service.getBase64FromBuffer(pictureReadable) };
  }

  @Roles('admin')
  @Patch('/document/:pictureId/status/:status')
  async updateUserDocPicture(
    @Param() params: UpdateUserDocumentPictureStatusAdminParamDto,
  ): Promise<{ success: true }> {
    const picture = await this.userService.getUserPfDocumentPictureRecordById(params.pictureId);

    if (!picture) {
      throw new NotFoundException('Picture Not found.');
    }

    await this.userService.updateUserDocumentPictureStatus(params.pictureId, params.status);

    return { success: true };
  }

  @Roles('admin')
  @Patch('/free/certificates/:userId')
  async giveUserFreeCertificates(
    @Param('userId') userId: string,
  ): Promise<{ success: true }> {
    const user = await this.userService.getUserById(userId)

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    if (user.type !== "PF") {
      throw new BadRequestException('User must be PF');
    }

    await this.userService.updateUserFreeCertificatesAdmin(userId, user.freeCertificates);

    return { success: true };
  }
}