import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { DateFormat } from '../interceptors/dateformat.interceptor';
import { Roles } from '../users/decorators';
import { RolesGuard } from '../users/guards';
import { JwtGuard } from '../auth/guard';
import { PJUsersService } from './pjusers.service';
import { ApiTags } from '@nestjs/swagger';
import { AuxService } from '../_aux/_aux.service';
import { TPessoaFisicaCreateWoUserInput, TUserCreateInput } from '../auth/types/auth.types';
import { AuthService } from '../auth/auth.service';
import { CognitoService } from '../aws/cognito/cognito.service';
import { SESService } from '../aws/ses/ses.service';
import { TPessoaJuridicaUpdateInput } from '../users/types/user.types';
import { UsersService } from '../users/users.service';
import {
  ResponseCheckUserDto,
  ResponseDeletedPJAdminDto,
  ResponsePJAdminDto,
  ResponsePjAssociateAdminInfoDto,
  ResponseInfoPjUsersDto,
} from './dtos/pjusers-response.dto';
import {
  AssociatePJAdminDto,
  CreatePJAdminDto,
  EditOrDeletePJAdminDto,
  EditPJInfoDto,
  EnvironmentEnum,
} from './dtos/pjusers-input.dto';
import {
  TCorporateAdminsWithPfOutput,
  TPessoaJuridicaWithSociosOutput,
  TPjAdminsWithPfOutput,
} from './types/pjusers.types';

@ApiTags('User PJ -- Users')
@Controller('pjusers')
@UseGuards(JwtGuard)
export class PJUsersController {
  constructor(
    private readonly pjUserService: PJUsersService,
    private readonly auxService: AuxService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly cognitoService: CognitoService,
    private readonly sesService: SESService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles('review')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Get('/info')
  async getPjInfo(@GetUser('id') userId: string): Promise<ResponseInfoPjUsersDto> {
    const info = await this.pjUserService.getPjUserById(userId);

    return this.getPessoaJuridicaWithSociosResponse(info);
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Patch('/info')
  async editPjInfo(@GetUser('id') userId: string, @Body() dto: EditPJInfoDto): Promise<ResponseInfoPjUsersDto> {
    const partner = dto.partner;
    const parnerId = await this.pjUserService.getPartnerId(userId);
    const data: TPessoaJuridicaUpdateInput = {
      razaoSocial: dto.companyName,
      nomeFantasia: dto.fantasyName,
      telefone: dto.phone,
      dataDeFundacao: this.auxService.formatDate(dto.dateCreation),
      segmento: dto.category,
      socios: {
        updateMany: [
          {
            where: { sociosId: parnerId },
            data: {
              nome: partner.name,
              telefone: partner.phone,
              dataDeNascimento: this.auxService.formatDate(partner.birthdate),
              cepNumber: partner.address.zipCode,
              estado: partner.address.state,
              cidade: partner.address.city,
              bairro: partner.address.neighborhood,
              rua: partner.address.street,
              numero: partner.address.streetNumber,
              complemento: partner.address.complementary,
            },
          },
        ],
      },
    };

    const info = await this.pjUserService.editPjInfo(userId, data);

    return this.getPessoaJuridicaWithSociosResponse(info);
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Get('/admins')
  async getAdmins(@GetUser('id') userId: string): Promise<Array<ResponsePjAssociateAdminInfoDto>> {
    const pj = await this.auxService.getPjInfo(userId);

    const institutionalAdmins = (await this.usersService.getPjInstitutionalAdmins(pj.idPJ)).map((admin) => ({
      document: admin.pf.user.numeroDocumento,
      status: admin.pf.user.status,
      name: admin.pf.nome,
      email: admin.pf.user.email,
      pjRoles: [
        {
          adminId: admin.idAdmin,
          createdAt: admin.pf.user.createdAt,
          updatedAt: admin.pf.user.updatedAt,
          role: admin.role,
          environment: EnvironmentEnum.institutional,
        },
      ],
    }));

    const corporateAdmins = (await this.usersService.getPjCorporateAdmins(pj.idPJ)).map((admin) => ({
      document: admin.pf.user.numeroDocumento,
      status: admin.pf.user.status,
      name: admin.pf.nome,
      email: admin.pf.user.email,
      pjRoles: [
        {
          adminId: admin.idCorporateAdmin,
          createdAt: admin.pf.user.createdAt,
          updatedAt: admin.pf.user.updatedAt,
          role: admin.role,
          environment: EnvironmentEnum.corporate,
        },
      ],
    }));

    const adminMap = new Map();
    [...institutionalAdmins, ...corporateAdmins].forEach((admin) => {
      if (!adminMap.has(admin.document)) {
        adminMap.set(admin.document, {
          name: admin.name,
          email: admin.email,
          document: admin.document,
          status: admin.status,
          pjRoles: [...admin.pjRoles],
        });
      } else {
        const existingAdmin = adminMap.get(admin.document);
        existingAdmin.pjRoles.push(...admin.pjRoles);
      }
    });

    return Array.from(adminMap.values());
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Get('/user/:info')
  async getUserInfo(@Param('info') info: string): Promise<ResponseCheckUserDto> {
    const userInfo = await this.pjUserService.getUserByEmailOrDocument(info);

    if (!userInfo) {
      return {
        isFound: false,
        email: null,
        cpf: null,
        name: null,
      };
    }

    return {
      isFound: true,
      email: this.auxService.getCensoredEmail(userInfo.email),
      cpf: userInfo.numeroDocumento,
      name: userInfo?.pessoaFisica?.nome ?? userInfo?.tempName ?? '',
    };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Post('/associate')
  async associateUserAdmin(
    @GetUser('id') userId: string,
    @Body() dto: AssociatePJAdminDto,
  ): Promise<ResponsePjAssociateAdminInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);
    const pf = await this.pjUserService.getUserByEmailOrDocument(dto.cpf);

    if (!pf) {
      throw new NotFoundException('User not found');
    }
    console.log(dto.environment);

    let adminInfo: TCorporateAdminsWithPfOutput | TPjAdminsWithPfOutput;
    let adminId: string;
    if (dto.environment === EnvironmentEnum.institutional) {
      const existingAdmin = await this.pjUserService.getInstitutionalAdmin(pj.idPJ, pf.pessoaFisica.idPF);

      if (!existingAdmin) {
        adminInfo = await this.pjUserService.associateInstutitionalAdminRecord(pj.idPJ, pf.pessoaFisica.idPF, dto.role);
      } else {
        adminInfo = existingAdmin;
      }

      adminId = adminInfo.idAdmin;
    } else if (dto.environment === EnvironmentEnum.corporate) {
      const existingAdmin = await this.pjUserService.getCorporateAdmin(pj.idPJ, pf.pessoaFisica.idPF);

      if (!existingAdmin) {
        adminInfo = await this.pjUserService.associateCorporateAdminRecord(pj.idPJ, pf.pessoaFisica.idPF, dto.role);
      } else {
        adminInfo = existingAdmin;
      }

      adminId = adminInfo.idCorporateAdmin;
    } else {
      throw new BadRequestException('Environment Not Accepted');
    }

    return {
      status: adminInfo.pf.user.status,
      document: adminInfo.pf.user.numeroDocumento,
      name: adminInfo.pf.nome,
      email: adminInfo.pf.user.email,
      pjAdmins: [
        {
          adminId: adminId,
          createdAt: adminInfo.createdAt,
          updatedAt: adminInfo.updatedAt,
          role: adminInfo.role,
          environment: dto.environment,
        },
      ],
    };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Patch('status/institutional/:idPj')
  async enableUserInstitutionalAdmin(
    @GetUser('id') userId: string,
    @Param('idPj') idPj: string,
  ): Promise<{ success: true }> {
    const pf = await this.auxService.getPfInfo(userId);

    const associationData = await this.pjUserService.getInstitutionalAdmin(idPj, pf.idPF);

    if (!associationData) {
      throw new NotFoundException('Association not found');
    }

    await this.pjUserService.updateInstitutionalAdminStatus(associationData.idAdmin);

    return { success: true };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Patch('status/corporate/:idPj')
  async enableUserCorporateAdmin(
    @GetUser('id') userId: string,
    @Param('idPj') idPj: string,
  ): Promise<{ success: true }> {
    const pf = await this.auxService.getPfInfo(userId);

    const associationData = await this.pjUserService.getCorporateAdmin(idPj, pf.idPF);

    if (!associationData) {
      throw new NotFoundException('Association not found');
    }

    await this.pjUserService.updateCorporateAdminStatus(associationData.idCorporateAdmin);

    return { success: true };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Post('/create')
  async createUserAdmin(
    @GetUser('id') userId: string,
    @Body() dto: CreatePJAdminDto,
  ): Promise<Array<ResponsePjAssociateAdminInfoDto>> {
    const dob = this.auxService.formatDate(dto.pfInfo.DOB);
    if (!dob) {
      throw new BadRequestException('Data de nascimento invalida');
    }

    const checkUser = await this.authService.checkUser(dto.documentNumber, dto.email);

    if (checkUser.exist) {
      throw new BadRequestException(checkUser.errorMessage);
    }

    const pj = await this.auxService.getPjInfo(userId);

    const pf: TPessoaFisicaCreateWoUserInput = {
      nome: dto.pfInfo.name,
      telefone: dto.pfInfo.phoneNumber,
      dataDeNascimento: dob,
      cepNumber: dto.pfInfo.cepNumber,
      estado: dto.pfInfo.state,
      cidade: dto.pfInfo.city,
      bairro: dto.pfInfo.region,
      rua: dto.pfInfo.street,
      numero: dto.pfInfo.houseNumber,
      complemento: dto.pfInfo.complement,
    };

    const data: TUserCreateInput = {
      numeroDocumento: dto.documentNumber,
      email: dto.email,
      type: 'PF',
      pessoaFisica: { create: pf },
    };

    if (dto.environment === EnvironmentEnum.institutional) {
      pf.pjAdmin.create = { idPJ: pj.idPJ, role: dto.role };
    }

    if (dto.environment === EnvironmentEnum.corporate) {
      pf.corporateAdmins.create = { idPJ: pj.idPJ, role: dto.role };
    }

    const password = this.auxService.generateRandomPassword();

    await this.cognitoService.adminCreateNewUserCognito({ email: data.email, userType: 'PF', password: password });

    await this.sesService.sendNewUserPassword(data.email, password, data?.tempName ?? '');

    await this.authService.signUpPfUserWithoutCognito(data);

    return await this.getAdmins(userId);
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Patch('associate')
  async editUserAdmin(@GetUser('id') userId: string, @Body() dto: EditOrDeletePJAdminDto): Promise<ResponsePJAdminDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const institutionalAdmins = dto.admins
      .filter((x) => x.environment === EnvironmentEnum.institutional)
      .map((x) => {
        return { adminId: x.adminId, role: x.role };
      });

    const corporateAdmins = dto.admins
      .filter((x) => x.environment === EnvironmentEnum.corporate)
      .map((x) => {
        return { adminId: x.adminId, role: x.role };
      });

    const validInstitutionalAdminsIds = await this.pjUserService.getValidInstitutionalAdminsIds(
      pj.idPJ,
      institutionalAdmins.map((x) => x.adminId),
    );

    const validCorporateAdminsIds = await this.pjUserService.getValidCorporateAdminsIds(
      pj.idPJ,
      corporateAdmins.map((x) => x.adminId),
    );

    if (validInstitutionalAdminsIds.length === 0 && validCorporateAdminsIds.length === 0) {
      throw new BadRequestException('No valid Admin to updates');
    }

    await this.pjUserService.updateInstitutionalAdminRole(
      institutionalAdmins.filter((x) => validInstitutionalAdminsIds.includes(x.adminId)),
    );

    await this.pjUserService.updateCorporateAdminRole(
      corporateAdmins.filter((x) => validCorporateAdminsIds.includes(x.adminId)),
    );

    return {
      admins: await this.getAdmins(userId),
      notFound: dto.admins.map((x) => {
        if (![...validInstitutionalAdminsIds, ...validCorporateAdminsIds].includes(x.adminId)) {
          return x.adminId;
        }
      }),
    };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Delete()
  async deleteUserAdmin(
    @GetUser('id') userId: string,
    @Body() dto: EditOrDeletePJAdminDto,
  ): Promise<ResponseDeletedPJAdminDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const institutionalAdmins = dto.admins
      .filter((x) => x.environment === EnvironmentEnum.institutional)
      .map((x) => x.adminId);
    const corporateAdmins = dto.admins.filter((x) => x.environment === EnvironmentEnum.corporate).map((x) => x.adminId);

    const validInstitutionalAdminsIds = await this.pjUserService.getValidInstitutionalAdminsIds(
      pj.idPJ,
      institutionalAdmins,
    );

    const validCorporateAdminsIds = await this.pjUserService.getValidCorporateAdminsIds(pj.idPJ, corporateAdmins);

    if (validInstitutionalAdminsIds.length === 0 && validCorporateAdminsIds.length === 0) {
      return { deleted: [], notFound: dto.admins.map((x) => x.adminId) };
    }

    await this.pjUserService.deleteInstitutionalAdmins(validInstitutionalAdminsIds);
    await this.pjUserService.deleteCorporateAdmins(validCorporateAdminsIds);

    const deleted = [...validInstitutionalAdminsIds, ...validCorporateAdminsIds];
    return {
      deleted: deleted,
      notFound: dto.admins.map((admin) => {
        if (!deleted.includes(admin.adminId)) {
          return admin.adminId;
        }
      }),
    };
  }

  private getPessoaJuridicaWithSociosResponse(info: TPessoaJuridicaWithSociosOutput): ResponseInfoPjUsersDto {
    return {
      email: info.email,
      phone: info.telefone,
      companyName: info.razaoSocial,
      fantasyName: info.nomeFantasia,
      cnpj: info.CNPJ,
      dateCreation: info.dataDeFundacao,
      category: info.segmento,
      partner: info.socios
        .map((partner) => {
          return {
            cpf: partner.CPF,
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
        })
        .at(0),
    };
  }
}
