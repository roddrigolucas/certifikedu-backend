import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CertificateStatus, User, UserType } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { Roles } from './decorators';
import { RolesGuard } from './guards';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DateFormat } from '../interceptors/dateformat.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { AuxService } from '../_aux/_aux.service';
import { SESService } from '../aws/ses/ses.service';
import { PaymentsService } from '../payments/services/payments.service';
import { S3Service } from '../aws/s3/s3.service';
import { UpdatePfInfoDto, UpdateRawUserDto } from './dtos/users-input.dto';
import { EnvironmentEnum } from '../pjusers/dtos/pjusers-input.dto';
import { TDocumentPictureCreateInput, TPessoaFisicaCreateInput, TPessoaFisicaUpdateInput } from './types/user.types';
import {
  ResponsePfDocumentDto,
  ResponsePfInfoDto,
  ResponsePJUserInfoDto,
  ResponseRawUserDataDto,
  ResponseRawUserInfoDto,
} from './dtos/users-response.dto';

@ApiTags('PF User -- User Info')
@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly auxService: AuxService,
    private readonly paymentService: PaymentsService,
    private readonly sesService: SESService,
    private readonly s3Service: S3Service,
  ) {}

  @UseGuards(RolesGuard)
  @Roles('review')
  @Get('/info')
  @UseInterceptors(new DateFormat(['birthDate', 'createdAt', 'updatedAt', 'nextCertificateDate', 'nextPayment']))
  async getUserInfo(
    @GetUser('id') userId: string,
    @GetUser('type') userType: UserType,
    @GetUser('numeroDocumento') userDocument: string,
  ): Promise<ResponsePfInfoDto | ResponseRawUserInfoDto | ResponsePJUserInfoDto> {
    if (userType === UserType.PJ) {
      return this.getUserPjInfo(userId);
    }

    const isPf = await this.auxService.getPfInfo(userId);

    if (!isPf) {
      return { response: { data: { userInfo: { isRaw: true } } } };
    }

    return await this.getUserPfInfo(userId, userDocument);
  }

  @UseGuards(RolesGuard)
  @Roles('review')
  @Get('/raw/info')
  async getRawUserInfo(@GetUser() user: User): Promise<ResponseRawUserDataDto> {
    if (!(await this.userService.checkIsRawUserById(user.id))) {
      throw new BadRequestException('User is not raw');
    }

    return {
      email: user.email,
      documentNumber: user.numeroDocumento,
      name: user?.tempName ?? '',
      phone: user?.tempPhone ?? '',
      fromCanvas: user.fromCanvas,
    };
  }

  @UseGuards(RolesGuard)
  @Roles('review')
  @Patch('/raw')
  async updateRawUserInfo(@GetUser() user: User, @Body() dto: UpdateRawUserDto): Promise<ResponsePfInfoDto> {
    if (!(await this.userService.checkIsRawUserById(user.id))) {
      throw new BadRequestException('User is not raw');
    }

    let birthDate: Date;
    try {
      birthDate = new Date(dto.birthdate);
    } catch (err) {
      throw new BadRequestException('Unable to parse birthDate');
    }

    const pfData: TPessoaFisicaCreateInput = {
      user: { connect: { id: user.id } },
      nome: dto.name,
      telefone: dto.phone,
      dataDeNascimento: birthDate,
      cepNumber: dto.zipCode,
      estado: dto.state,
      cidade: dto.city,
      bairro: dto.region,
      rua: dto.city,
      numero: dto.streetNumber,
      complemento: dto?.complementary ?? null,
    };

    if (user?.tempSchool) {
      pfData.schools = { connect: { schoolId: user.tempSchool } };
    }

    if (user?.tempCourse) {
      pfData.courses = { create: { courseId: user.tempCourse } };
    }

    if (user?.fromCanvas) {
      pfData.canvasUser = { connect: { canvasEmail: user.email } };
    }

    await this.userService.updateRawUserInfo(pfData);

    return this.getUserPfInfo(user.id, user.numeroDocumento);
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @UseInterceptors(new DateFormat(['birthDate', 'createdAt', 'updatedAt']))
  //TODO: CHANGE TO PUT
  @Patch('update/pf/info')
  async updateCurrentPfInfo(
    @GetUser('id') userId: string,
    @GetUser('type') userType: UserType,
    @Body() dto: UpdatePfInfoDto,
  ) {
    if (userType !== UserType.PF) {
      throw new BadRequestException('User is not PF');
    }

    const pf = await this.auxService.getPfInfo(userId);

    const data: TPessoaFisicaUpdateInput = {
      nome: dto?.name ?? pf.nome,
      telefone: dto?.phone ?? pf.telefone,
      dataDeNascimento: dto?.birthDate ?? pf.dataDeNascimento,
      cepNumber: dto?.zipCode ?? pf.cepNumber,
      estado: dto?.state ?? pf.estado,
      cidade: dto?.city ?? pf.cidade,
      bairro: dto?.neighborhood ?? pf.bairro,
      rua: dto?.street ?? pf.rua,
      numero: dto?.number ?? pf.numero,
    };

    const pessoaFisica = await this.userService.updatePfInfo(userId, data);

    return {
      status: 'Success',
      response: {
        data: {
          userData: {
            naturalPerson: {
              id: pessoaFisica.idPF,
              createdAt: pessoaFisica.createdAt,
              updatedAt: pessoaFisica.updatedAt,
              userId: pessoaFisica.userId,
              cpf: pessoaFisica.CPF,
              name: pessoaFisica.nome,
              email: pessoaFisica.email,
              phone: pessoaFisica.telefone,
              birthDate: pessoaFisica.dataDeNascimento,
              zipCode: pessoaFisica.cepNumber,
              state: pessoaFisica.estado,
              city: pessoaFisica.cidade,
              neighborhood: pessoaFisica.bairro,
              street: pessoaFisica.rua,
              number: pessoaFisica.numero,
              additionalDetails: pessoaFisica.complemento,
            },
          },
        },
      },
    };
  }

  @UseGuards(RolesGuard)
  @Roles('review')
  @UseInterceptors(FileInterceptor('file'))
  @Post('document')
  async addUserDocPicture(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<ResponsePfDocumentDto> {
    if (!file) throw new BadRequestException('File not accessible');

    const pf = await this.auxService.getPfInfo(userId);

    const fileType = file.originalname.split('.').slice(-1).join();

    const createdAt = new Date();
    const pictureHash = this.userService.createUniqueDocumentPictureHash(userId, createdAt);

    const s3Url = this.auxService.getUserDocumentPicturePath(userId, pictureHash, fileType);

    await this.s3Service.uploadFile(this.auxService.nestBucket, s3Url, file);

    const data: TDocumentPictureCreateInput = {
      user: { connect: { id: userId } },
      createdAt: createdAt,
      fotoHash: pictureHash,
      fotoType: fileType,
      s3Url: s3Url,
      status: CertificateStatus.ENABLED,
    };

    await this.userService.createUserDocPicture(data);

    this.sesService.sendNewDocumentAdmin(pf.email);
    this.sesService.sendDocumentReceived(pf.email, pf.nome);

    return {
      status: 'Success',
      response: {
        data: {
          pictureStatus: CertificateStatus.ENABLED,
        },
      },
    };
  }

  private async getUserPfInfo(userId: string, userDocument: string): Promise<ResponsePfInfoDto> {
    const user = await this.userService.getPessoaFisicaByUserId(userId);
    const docPicture = await this.userService.getUserLastDocumentPicture(userId);

    let creditInfo: any = { planId: null, nextCertificateDate: null, plan: null, customerId: null, certificateCredits: 0, additionalCertificatesCredits: 0, monthSpentCredits: 0, subsciptionId: null };
    let userCards: any[] = [];
    let defaultCardId: string | null = null;

    try {
      creditInfo = await this.paymentService.getUserCredits(userId);
    } catch (err) {
      // No payment customer for this user yet — safe to ignore
    }

    try {
      userCards = await this.paymentService.getUserCards(userId);
    } catch (err) {
      // No cards for this user yet — safe to ignore
    }

    try {
      defaultCardId = await this.paymentService.getUserDefaultCardId(user.id);
    } catch (err) {
      // No default card — safe to ignore
    }

    return {
      status: 'Success',
      response: {
        data: {
          userInfo: {
            id: user.id,
            email: user.email,
            document: user.numeroDocumento,
            type: user.type,
            status: user.status,
            isRaw: false,
            apiEnabled: user.apiEnabled,
            pictureStatus: docPicture?.status ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            receivedCertificateQty: await this.userService.getUserReceivedCertificatesByDocument(userDocument),
            emmitedCertificateQty: await this.userService.getUserEmmitedCertificatesByDocument(userDocument),
            planId: creditInfo.planId,
            nextPayment: creditInfo.nextCertificateDate,
            paymentCardId: defaultCardId,
            pjs: await this.userService.getUserCompanies(user.pessoaFisica.idPF),
            hasProfessionalProfile: user.pessoaFisica?.professionalProfile?.id ? true : false,
            hasResumes: user.pessoaFisica?.resumes?.length > 0 ? true : false,
          },
          userData: {
            naturalPerson: {
              id: user.pessoaFisica.idPF,
              createdAt: user.pessoaFisica.createdAt,
              updatedAt: user.pessoaFisica.updatedAt,
              userId: user.id,
              cpf: user.numeroDocumento,
              name: user.pessoaFisica.nome,
              email: user.email,
              phone: user.pessoaFisica.telefone,
              birthDate: user.pessoaFisica.dataDeNascimento,
              zipCode: user.pessoaFisica.cepNumber,
              state: user.pessoaFisica.estado,
              city: user.pessoaFisica.cidade,
              neighborhood: user.pessoaFisica.bairro,
              street: user.pessoaFisica.rua,
              number: user.pessoaFisica.numero,
              additionalDetails: user.pessoaFisica.complemento,
            },
          },
          userCards: userCards.map((card) => {
            return {
              id: user.id,
              ...card,
            };
          }),
          userCredits: {
            plan: creditInfo.plan,
            customerId: creditInfo.customerId,
            certificateCredits: creditInfo.certificateCredits,
            additionalCertificateCredits: creditInfo.additionalCertificatesCredits,
            monthSpentCredits: creditInfo.monthSpentCredits,
            nextCertificateDate: creditInfo.nextCertificateDate,
            subscriptionId: creditInfo.subsciptionId,
          },
        },
      },
    };
  }

  private async getUserPjInfo(userId: string): Promise<ResponsePJUserInfoDto> {
    const pj = await this.userService.getPessoaJuridicaByUserId(userId);

    if (!pj) {
      throw new NotFoundException('PJ not Found');
    }

    const institutionalAdmins = (await this.userService.getPjInstitutionalAdmins(pj.pessoaJuridica.idPJ)).map(
      (admin) => ({
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
      }),
    );

    const corporateAdmins = (await this.userService.getPjCorporateAdmins(pj.pessoaJuridica.idPJ)).map((admin) => ({
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

    return {
      status: 'SUCCESS',
      response: {
        data: {
          userInfo: {
            userId: pj.id,
            name: pj.pessoaJuridica.nomeFantasia,
            status: pj.status,
            type: pj.type,
            ltiEnabled: pj.ltiEnabled,
            canvasConfigured: pj.pessoaJuridica.ltiConfiguration ? true : false,
            apiEnabled: pj.apiEnabled,
            admins: Array.from(adminMap.values()),
            apiKey:
              pj.apiKey?.length > 0
                ? {
                    createdAt: pj.apiKey.at(0).createdAt,
                    updatedAt: pj.apiKey.at(0).updatedAt,
                    apiKey: pj.apiKey.at(0).apiKey,
                  }
                : null,
          },
        },
      },
    };
  }
}
