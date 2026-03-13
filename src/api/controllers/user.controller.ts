import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../auth/auth.service';
import { TPessoaFisicaCreateWoUserInput, TUserCreateInput } from '../../auth/types/auth.types';
import { AuxService } from '../../_aux/_aux.service';
import { CognitoService } from '../../aws/cognito/cognito.service';
import { SESService } from '../../aws/ses/ses.service';
import { SchoolsService } from '../../schools/schools.service';
import { UsersService } from '../../users/users.service';
import { GetUser } from '../../auth/decorators';
import { AddUserToSchoolAPIDto, CreateNewUserAPIDto } from '../dtos/user/user-input.dto';
import { UserInfoAPIDto } from '../dtos/user/user-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Users')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class UsersAPIController {
  constructor(
    private readonly auxService: AuxService,
    private readonly authService: AuthService,
    private readonly schoolService: SchoolsService,
    private readonly cognitoService: CognitoService,
    private readonly sesService: SESService,
    private readonly userService: UsersService,
  ) { }

  @Post('create/user')
  async createNewUserAPI(
    @GetUser('id') userId: string,
    @Body() newUserInfo: CreateNewUserAPIDto,
  ): Promise<UserInfoAPIDto> {
    const dob = this.auxService.formatDate(newUserInfo.pfInfo.DOB);
    if (!dob) {
      throw new BadRequestException('Data de nascimento invalida');
    }

    const pj = await this.auxService.getPjInfo(userId);
    const school = await this.schoolService.getSchoolByCnpj(newUserInfo.schoolCnpj);

    if (!school) {
      throw new NotFoundException('school not found');
    }

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const checkUser = await this.authService.checkUser(newUserInfo.documentNumber, newUserInfo.email);

    if (checkUser.exist) {
      throw new BadRequestException(checkUser.errorMessage);
    }

    const pf: TPessoaFisicaCreateWoUserInput = {
      nome: newUserInfo.pfInfo.name,
      telefone: newUserInfo.pfInfo.phoneNumber,
      dataDeNascimento: dob,
      cepNumber: newUserInfo.pfInfo.cepNumber,
      estado: newUserInfo.pfInfo.state,
      cidade: newUserInfo.pfInfo.city,
      bairro: newUserInfo.pfInfo.region,
      rua: newUserInfo.pfInfo.street,
      numero: newUserInfo.pfInfo.houseNumber,
      complemento: newUserInfo.pfInfo?.complement ?? '',
      schools: { connect: { schoolId: school.schoolId } },
    };

    const data: TUserCreateInput = {
      numeroDocumento: newUserInfo.documentNumber,
      email: newUserInfo.email,
      type: 'PF',
      pessoaFisica: { create: pf },
    };

    const password = this.auxService.generateRandomPassword();

    await this.cognitoService.adminCreateNewUserCognito({ email: data.email, userType: 'PF', password: password });

    await this.sesService.sendNewUserPassword(data.email, password, data?.tempName ?? '');

    await this.authService.signUpPfUserWithoutCognito(data);

    const userRecord = await this.userService.getUserPfByDocumentWithSchools(newUserInfo.documentNumber);

    return {
      name: userRecord.pessoaFisica.nome,
      userId: userRecord.id,
      email: userRecord.email,
      documentNumber: userRecord.numeroDocumento,
      associatedSchools: userRecord.pessoaFisica.schools.map((school) => {
        return school.schoolId;
      }),
    };
  }

  @Get('/users')
  async getAssociatedUsersAPI(@GetUser('id') userId: string): Promise<Array<UserInfoAPIDto>> {
    const pj = await this.auxService.getPjInfo(userId);
    const userRecords = await this.userService.getUsersPfAssociatedWithPjSchools(pj.idPJ);

    return userRecords.map((userRecord) => {
      return {
        userId: userRecord.id,
        name: userRecord.pessoaFisica.nome,
        email: userRecord.email,
        documentNumber: userRecord.numeroDocumento,
        associatedSchools: userRecord.pessoaFisica.schools.map((school) => {
          return school.schoolId;
        }),
      };
    });
  }

  @Get('user/:cpf')
  async getUserInfoAPI(@GetUser('id') userId: string, @Param('cpf') cpf: string): Promise<UserInfoAPIDto> {
    const userRecord = await this.userService.getUserPfByDocumentWithSchools(cpf);
    const pj = await this.auxService.getPjInfo(userId);

    if (!userRecord) {
      throw new NotFoundException(`User with CPF ${cpf} was not found.`);
    }

    const ownerUsers = userRecord.pessoaFisica.schools.map((school) => {
      return school.ownerUserId;
    });

    if (!ownerUsers.includes(pj.idPJ)) {
      throw new ForbiddenException('This CPF is not associated with a school pertaining to this user.');
    }

    return {
      userId: userRecord.id,
      name: userRecord.pessoaFisica.nome,
      email: userRecord.email,
      documentNumber: userRecord.numeroDocumento,
      associatedSchools: userRecord.pessoaFisica.schools.map((school) => {
        return school.schoolId;
      }),
    };
  }

  @Patch('add/user/school')
  async addUsersToSchoolAPI(
    @GetUser('id') userId: string,
    @Body() userSchoolInfo: AddUserToSchoolAPIDto,
  ): Promise<{ associated: Array<UserInfoAPIDto>; notFound: string[] }> {
    const pj = await this.auxService.getPjInfo(userId);

    const school = await this.schoolService.getSchoolById(userSchoolInfo.schoolId);

    if (!school) {
      throw new NotFoundException(`School ${userSchoolInfo.schoolId} was not found.`);
    }

    if (!(school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException(`User is not the owner of this school ${userSchoolInfo.schoolId}.`);
    }

    const usersRecords = await this.userService.associateUsersToSchool(
      userSchoolInfo.schoolId,
      userSchoolInfo.documentNumbers,
    );

    const foundDocuments: string[] = usersRecords.map((user) => {
      return user.numeroDocumento;
    });

    return {
      associated: usersRecords.map((user) => {
        return {
          userId: user.id,
          name: user.pessoaFisica.nome,
          email: user.email,
          documentNumber: user.numeroDocumento,
          associatedSchools: user.pessoaFisica.schools.map((school) => {
            return school.schoolId;
          }),
        };
      }),
      notFound: userSchoolInfo.documentNumbers.filter((documentNumber) => !foundDocuments.includes(documentNumber)),
    };
  }
}
