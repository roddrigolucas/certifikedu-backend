import { Body, Controller, Get, Param, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EditPJInfoDto } from '../../pjusers/dtos/pjusers-input.dto';
import { JwtGuard } from '../../auth/guard';
import { RolesGuard } from '../../users/guards';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { Roles } from '../../users/decorators';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { GetUser } from '../../auth/decorators';
import { DateFormat } from '../../interceptors/dateformat.interceptor';
import { ResponsePjInfoDto, ResponseProfilePjInfoDto } from '../dtos/pjuser/pjuser-response.dto';
import { PJUsersService } from '../../pjusers/pjusers.service';
import { TPessoaJuridicaUpdateInput } from '../../users/types/user.types';
import { AuxService } from '../../_aux/_aux.service';
import { TPessoaJuridicaWithSociosOutput } from '../../pjusers/types/pjusers.types';
import { CertificatesService } from 'src/certificates/certificates.service';
import { SchoolsService } from '../../schools/schools.service';
import { UsersService } from '../../users/users.service';

@ApiTags('Institutional -- Parent PJ Info')
@Controller('pj/:pjId')
@UseGuards(JwtGuard)
export class PJUsersInstitutionalController {
  constructor(
    private readonly pjUsersService: PJUsersService,
    private readonly auxService: AuxService,
    private readonly certificateService: CertificatesService,
    private readonly schoolService: SchoolsService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Get('/parent/info')
  async getPjInfo(@GetUser('id') userId: string): Promise<ResponsePjInfoDto> {
    const info = await this.pjUsersService.getPjUserById(userId);

    return this.getPessoaJuridicaWithSociosResponse(info);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Patch('/parent/info')
  async editParentInfo(@GetUser('id') userId: string, @Body() dto: EditPJInfoDto): Promise<ResponsePjInfoDto> {
    const partner = dto.partner;
    const parnerId = await this.pjUsersService.getPartnerId(userId);
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

    const info = await this.pjUsersService.editPjInfo(userId, data);

    return this.getPessoaJuridicaWithSociosResponse(info);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @Get('/profile')
  async profileInfo(@Param('pjId') idPj: string, @GetUser('id') userId: string): Promise<ResponseProfilePjInfoDto> {
    const schools = await this.schoolService.getAllUserSchoolsWithAll(idPj);

    const schoolsIds = schools.map((school) => {
      return school.schoolId;
    });

    const students = await this.usersService.getAllSchoolsStudents(schools.map((school) => school.schoolId));

    const schoolsData = schools.map((school) => {
      return {
        schoolId: school.schoolId,
        schoolName: school.name,
        emmitedCertificatesQty: school.certificates.length,
        createdCertificatesQty: school.templates.length,
        studentsQty: students
          .filter((student) => student.tempSchool === null)
          .filter((student) =>
            student.pessoaFisica.schools.map((studentSchool) => studentSchool.schoolId).includes(school.schoolId),
          ).length,
        tempStudentsQty: students.filter((student) => student.tempSchool === school.schoolId).length,
        coursesQty: school.courses.length,
      };
    });

    return {
      emmitedCertificatesQty: await this.certificateService.getUserEmmitedCertificateCount(userId),
      createdCertificatesQty: schools.reduce((acc, school) => acc + school.templates.length, 0),
      studentsQty: students.filter((student) => !schoolsIds.includes(student.tempSchool)).length,
      tempStudentsQty: students.filter((student) => schoolsIds.includes(student.tempSchool)).length,
      coursesQty: schools.reduce((acc, school) => acc + school.courses.length, 0),
      schools: schoolsData,
    };
  }

  private getPessoaJuridicaWithSociosResponse(info: TPessoaJuridicaWithSociosOutput): ResponsePjInfoDto {
    return {
      email: info.email,
      phone: info.telefone,
      companyName: info.razaoSocial,
      fantasyName: info.nomeFantasia,
      cnpj: info.CNPJ,
      dateCreation: info.dataDeFundacao,
      category: info.segmento,
      partners: info.socios.map((partner) => {
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
      }),
    };
  }
}
