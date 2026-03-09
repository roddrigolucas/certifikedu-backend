import { Body, Controller, Delete, Get, Param, Post, UseGuards, NotFoundException, Put, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guard';
import { Roles } from '../users/decorators';
import { RolesGuard } from '../users/guards';
import { ApiTags } from '@nestjs/swagger';
import { AuxService } from 'src/aux/aux.service';
import { ResumesService } from './resumes.service';
import {
  TResumeCreateInput,
  TResumeEducationCreate,
  TResumeEducationCreateWihtoutResume,
  TResumeEducationDelete,
  TResumeEducationUpdate,
  TResumeEducationUpdateWihtoutResume,
  TResumeExperienceCreate,
  TResumeExperienceCreateWihtoutResume,
  TResumeExperienceDelete,
  TResumeExperienceUpdate,
  TResumeExperienceUpdateWihtoutResume,
  TResumeLanguageCreate,
  TResumeLanguageDelete,
  TResumeLanguageUpdate,
  TResumeUpdateInput,
  TResumeWithDetailsOutput,
} from './types/resumes.types';
import { ResumeListResponseDto, ResumeResponseDto } from './dtos/resumes-response.dto';
import {
  CreateOrUpdateResumeDto,
  CreateOrUpdateResumeEducationDto,
  CreateOrUpdateResumeExperienceDto,
  CreateOrUpdateResumeLanguageDto,
} from './dtos/resumes-input.dto';
import { Prisma } from '@prisma/client';
import { RequestsService } from 'src/requests/requests.service';
import { IResumePdf } from './interfaces/resumes.interfaces';
import { ICreateResumePdfLambda } from 'src/requests/requests.interfaces';
import { TPessoaFisicaOutput } from 'src/aux/types/aux.types';

@ApiTags('Resume')
@Controller('resumes')
export class ResumesController {
  constructor(
    private readonly resumeService: ResumesService,
    private readonly auxService: AuxService,
    private readonly requestService: RequestsService,
  ) { }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get(':resumeId')
  async getResume(@Param('resumeId') resumeId: string, @GetUser('id') userId: string): Promise<ResumeResponseDto> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException('User not found');
    }

    const resume = await this.resumeService.getResume(resumeId);

    if (!resume || resume.idPF !== pf.idPF) {
      throw new NotFoundException('Resume not found');
    }

    return this.mapResumeResponse(resume);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get()
  async listResumes(@GetUser('id') userId: string): Promise<ResumeListResponseDto> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException('User not found');
    }

    const resumes = await this.resumeService.listResumes(pf.idPF);
    return { resumes };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Post()
  async createResume(@GetUser('id') userId: string, @Body() dto: CreateOrUpdateResumeDto): Promise<ResumeResponseDto> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException('User not found');
    }

    const data: TResumeCreateInput = {
      title: dto.title,
      description: dto.description,
      pf: { connect: { idPF: pf.idPF } },
      experiences: this.mapCreateExperiences(dto.experiences),
      education: this.mapCreateEducation(dto.educations),
      languages: this.mapCreateLanguages(dto.languages),
    };

    const resume = await this.resumeService.createResume(data);

    const pdfPath = this.auxService.getUserResumePdfPath(userId, resume.resumeId, resume.pdfVersion + 1);
    const lambdaData: ICreateResumePdfLambda = {
      subject: pdfPath,
      variables: JSON.stringify(this.getResumePdfData(pf, resume)),
      isPdf: true,
    }

    const success = await this.requestService.resumePdfLambda(lambdaData);

    if (success) {
      throw new ServiceUnavailableException('Lambda unable to create PDF file')
    }

    const updateData: TResumeUpdateInput = {
      pdfVersion: resume.pdfVersion + 1,
      pdfPath: pdfPath,
      hasPdf: true,
    } 

    const updatedResume = await this.resumeService.updateResume(resume.resumeId, updateData);

    return this.mapResumeResponse(updatedResume);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Put(':resumeId')
  async updateResume(
    @Param('resumeId') resumeId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateOrUpdateResumeDto,
  ): Promise<ResumeResponseDto> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException('User not found');
    }

    const existingResume = await this.resumeService.getResume(resumeId);

    if (!existingResume || existingResume.idPF !== pf.idPF) {
      throw new NotFoundException('Resume not found');
    }

    const experiencesData = this.mapUpdateExperiences(
      dto.experiences,
      existingResume.experiences.map((exp) => exp.resumeExperienceId),
    );
    const educationsData = this.mapUpdateEducations(
      dto.educations,
      existingResume.education.map((edu) => edu.resumeEducationId),
    );
    const languagesData = this.mapUpdateLanguages(
      dto.languages,
      existingResume.languages.map((lang) => lang.resumeLanguageId),
    );

    const data: TResumeUpdateInput = {
      title: dto.title,
      description: dto.description,
      experiences: {
        update: experiencesData.updates,
        create: experiencesData.creates,
        delete: experiencesData.deletes,
      },
      education: {
        update: educationsData.updates,
        create: educationsData.creates,
        delete: educationsData.deletes,
      },
      languages: {
        update: languagesData.updates,
        create: languagesData.creates,
        delete: languagesData.deletes,
      },
    };

    const resume = await this.resumeService.updateResume(resumeId, data);

    const pdfPath = this.auxService.getUserResumePdfPath(userId, resume.resumeId, resume.pdfVersion + 1);
    const pdfInfo = this.getResumePdfData(pf, resume)
    const lambdaData: ICreateResumePdfLambda = {
      subject: pdfPath,
      variables: JSON.stringify(pdfInfo),
      isPdf: true,
    }

    const success = await this.requestService.resumePdfLambda(lambdaData);

    if (success) {
      throw new ServiceUnavailableException('Lambda unable to create PDF file')
    }

    const updateData: TResumeUpdateInput = {
      pdfVersion: resume.pdfVersion + 1,
      pdfPath: pdfPath,
      hasPdf: true,
    } 

    const updatedResume = await this.resumeService.updateResume(resume.resumeId, updateData);

    return this.mapResumeResponse(updatedResume);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Delete(':resumeId')
  async deleteResume(@Param('resumeId') resumeId: string, @GetUser('id') userId: string) {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException('User not found');
    }

    const existingResume = await this.resumeService.getResume(resumeId);

    if (!existingResume || existingResume.idPF !== pf.idPF) {
      throw new NotFoundException('Resume not found');
    }

    await this.resumeService.deleteResume(resumeId);

    return { message: 'Resume deleted successfully' };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Post('pdf/:resumeId')
  async createPdf(@Param('resumeId') resumeId: string, @GetUser('id') userId: string): Promise<ResumeResponseDto> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException('User not found');
    }

    const resume = await this.resumeService.getResume(resumeId);

    if (!resume || resume.idPF !== pf.idPF) {
      throw new NotFoundException('Resume not found');
    }

    const pdfPath = this.auxService.getUserResumePdfPath(userId, resume.resumeId, resume.pdfVersion + 1);
    const lambdaData: ICreateResumePdfLambda = {
      subject: pdfPath,
      variables: JSON.stringify(this.getResumePdfData(pf, resume)),
      isPdf: true,
    }

    const success = await this.requestService.resumePdfLambda(lambdaData);

    if (!success) {
      throw new ServiceUnavailableException('Lambda unable to create PDF file')
    }

    const updateData: TResumeUpdateInput = {
      pdfVersion: resume.pdfVersion + 1,
      pdfPath: pdfPath,
      hasPdf: true,
    } 

    const updatedResume = await this.resumeService.updateResume(resume.resumeId, updateData);

    return this.mapResumeResponse(updatedResume);
  }

  private mapResumeResponse(resume: TResumeWithDetailsOutput): ResumeResponseDto {
    return {
      resumeId: resume.resumeId,
      description: resume.description,
      title: resume.title,
      createdAt: resume.createdAt,
      hasPdf: resume.hasPdf,
      pdfPath: resume.pdfPath,
      languages: resume.languages.map((lang) => ({
        resumeLanguageId: lang.resumeLanguageId,
        language: lang.language,
        level: lang.level,
        certificates: lang.certificates.map((cert) => ({
          certificateId: cert.certificate.certificateId,
          name: cert.certificate.name,
          description: cert.certificate.description,
          hash: cert.certificate?.hashes.filter((h) => h?.certificateHash)?.at(0)?.certificateHash ?? null,
          picture: cert.certificate.certificatePicture,
          createdAt: cert.certificate.createdAt,
        })),
      })),
      experiences: resume.experiences.map((exp) => ({
        resumeExperienceId: exp.resumeExperienceId,
        title: exp.title,
        description: exp.description,
        startYear: exp.startYear,
        startMonth: exp.startMonth,
        endYear: exp.endYear,
        endMonth: exp.endMonth,
        employmentType: exp.employmentType,
        workModel: exp.workModel,
        certificates: exp.certificates.map((cert) => ({
          certificateId: cert.certificate.certificateId,
          name: cert.certificate.name,
          description: cert.certificate.description,
          hash: cert.certificate?.hashes.filter((h) => h?.certificateHash)?.at(0)?.certificateHash ?? null,
          picture: cert.certificate.certificatePicture,
          createdAt: cert.certificate.createdAt,
        })),
        rawPJId: exp.rawPJ.rawPJId,
        companyName: exp.rawPJ.name,
        companyEmail: exp.rawPJ.email,
        companyPhone: exp.rawPJ.phone,
        companyCnpj: exp.rawPJ.cnpj,
        companyLocation: exp.rawPJ.location,
      })),
      educations: resume.education.map((edu) => ({
        resumeEducationId: edu.resumeEducationId,
        title: edu.title,
        description: edu.description,
        startYear: edu.startYear,
        startMonth: edu.startMonth,
        endYear: edu.endYear,
        endMonth: edu.endMonth,
        certificates: edu.certificates.map((cert) => ({
          certificateId: cert.certificate.certificateId,
          name: cert.certificate.name,
          description: cert.certificate.description,
          hash: cert.certificate?.hashes.filter((h) => h?.certificateHash)?.at(0)?.certificateHash ?? null,
          picture: cert.certificate.certificatePicture,
          createdAt: cert.certificate.createdAt,
        })),
        rawPJId: edu.rawPJ.rawPJId,
        institutionName: edu.rawPJ.name,
        institutionEmail: edu.rawPJ.email,
        institutionPhone: edu.rawPJ.phone,
        institutionCnpj: edu.rawPJ.cnpj,
        institutionLocation: edu.rawPJ.location,
      })),
    };
  }

  private mapCreateExperiences(experiences: CreateOrUpdateResumeExperienceDto[]) {
    if (!experiences) return undefined;

    return {
      create: experiences.map((exp) => ({
        title: exp.title,
        description: exp.description,
        startYear: exp.startYear,
        startMonth: exp.startMonth,
        endYear: exp.endYear,
        endMonth: exp.endMonth,
        employmentType: exp.employmentType,
        workModel: exp.workModel,
        rawPJ: {
          connectOrCreate: {
            where: { name: exp.companyName },
            create: {
              name: exp.companyName,
              email: exp.companyEmail,
              phone: exp.companyPhone,
              cnpj: exp.companyCnpj,
              location: exp.companyLocation,
            },
          },
        },
        certificates: exp.certificates
          ? {
            create: exp.certificates.map((certificateId) => ({
              certificate: { connect: { certificateId } },
            })),
          }
          : undefined,
      })),
    };
  }

  private mapCreateEducation(educations: CreateOrUpdateResumeEducationDto[]) {
    if (!educations) return undefined;

    return {
      create: educations.map((edu) => ({
        title: edu.title,
        description: edu.description,
        startYear: edu.startYear,
        startMonth: edu.startMonth,
        endYear: edu.endYear,
        endMonth: edu.endMonth,
        rawPJ: {
          connectOrCreate: {
            where: { name: edu.institutionName },
            create: {
              name: edu.institutionName,
              email: edu.institutionEmail,
              phone: edu.institutionPhone,
              cnpj: edu.institutionCnpj,
              location: edu.institutionLocation,
            },
          },
        },
        certificates: edu.certificates
          ? {
            create: edu.certificates.map((certificateId) => ({
              certificate: { connect: { certificateId } },
            })),
          }
          : undefined,
      })),
    };
  }

  private mapCreateLanguages(languages) {
    if (!languages) return undefined;

    return {
      create: languages.map((lang) => ({
        language: lang.language,
        level: lang.level,
        certificates: lang.certificates
          ? {
            create: lang.certificates.map((certificateId) => ({
              certificate: { connect: { certificateId } },
            })),
          }
          : undefined,
      })),
    };
  }

  private mapUpdateExperiences(
    dtoExperiences: CreateOrUpdateResumeExperienceDto[],
    existingExperienceIds: string[],
  ): {
    updates: TResumeExperienceUpdate[];
    creates: TResumeExperienceCreate[];
    deletes: TResumeExperienceDelete[];
  } {
    if (!dtoExperiences) return undefined;

    const updates: TResumeExperienceUpdate[] = [];
    const creates: TResumeExperienceCreate[] = [];

    const experiencesToDelete = existingExperienceIds.filter(
      (exp) => !dtoExperiences.some((dto) => dto.resumeExperienceId === exp),
    );

    const experiencesToUpdate = dtoExperiences.filter((dto) => existingExperienceIds.includes(dto.resumeExperienceId));

    const experiencesToCreate = dtoExperiences.filter((dto) => !dto.resumeExperienceId);

    experiencesToUpdate.forEach((exp) => {
      const data: TResumeExperienceUpdateWihtoutResume = {
        title: exp.title,
        description: exp.description,
        startYear: exp.startYear,
        startMonth: exp.startMonth,
        endYear: exp.endYear,
        endMonth: exp.endMonth,
        employmentType: exp.employmentType,
        workModel: exp.workModel,
        rawPJ: {
          connectOrCreate: {
            where: { name: exp.companyName },
            create: {
              name: exp.companyName,
              email: exp.companyEmail,
              phone: exp.companyPhone,
              cnpj: exp.companyCnpj,
              location: exp.companyLocation,
            },
          },
        },
        certificates: {
          deleteMany: {
            resumeExperienceId: exp.resumeExperienceId,
          },
          create: exp.certificates.map((certificateId) => ({
            certificate: { connect: { certificateId } },
          })),
        },
      };

      updates.push({
        where: { resumeExperienceId: exp.resumeExperienceId },
        data,
      });
    });

    experiencesToCreate.forEach((exp) => {
      const data: TResumeExperienceCreateWihtoutResume = {
        title: exp.title,
        description: exp.description,
        startYear: exp.startYear,
        startMonth: exp.startMonth,
        endYear: exp.endYear,
        endMonth: exp.endMonth,
        employmentType: exp.employmentType,
        workModel: exp.workModel,
        rawPJ: {
          connectOrCreate: {
            where: { name: exp.companyName },
            create: {
              name: exp.companyName,
              email: exp.companyEmail,
              phone: exp.companyPhone,
              cnpj: exp.companyCnpj,
              location: exp.companyLocation,
            },
          },
        },
        certificates: {
          create: exp.certificates.map((certificateId) => ({
            certificate: { connect: { certificateId } },
          })),
        },
      };

      creates.push(data);
    });

    return {
      updates,
      creates,
      deletes: experiencesToDelete.map((exp) => ({ resumeExperienceId: exp })),
    };
  }

  private mapUpdateEducations(
    dtoEducations: CreateOrUpdateResumeEducationDto[],
    existingEducationIds: string[],
  ): {
    updates: TResumeEducationUpdate[];
    creates: TResumeEducationCreate[];
    deletes: TResumeEducationDelete[];
  } {
    if (!dtoEducations) return undefined;

    const updates: TResumeEducationUpdate[] = [];
    const creates: TResumeEducationCreate[] = [];

    const educationsToDelete = existingEducationIds.filter(
      (exp) => !dtoEducations.some((dto) => dto.resumeEducationId === exp),
    );

    const educationsToUpdate = dtoEducations.filter((dto) => existingEducationIds.includes(dto.resumeEducationId));

    const educationsToCreate = dtoEducations.filter((dto) => !dto.resumeEducationId);

    educationsToUpdate.forEach((edu) => {
      const data: TResumeEducationUpdateWihtoutResume = {
        title: edu.title,
        description: edu.description,
        startYear: edu.startYear,
        startMonth: edu.startMonth,
        endYear: edu.endYear,
        endMonth: edu.endMonth,
        rawPJ: {
          connectOrCreate: {
            where: { name: edu.institutionName },
            create: {
              name: edu.institutionName,
              email: edu.institutionEmail,
              phone: edu.institutionPhone,
              cnpj: edu.institutionCnpj,
              location: edu.institutionLocation,
            },
          },
        },
        certificates: {
          deleteMany: {
            resumeEducationId: edu.resumeEducationId,
          },
          create: edu.certificates.map((certificateId) => ({
            certificate: { connect: { certificateId } },
          })),
        },
      };

      updates.push({
        where: { resumeEducationId: edu.resumeEducationId },
        data,
      });
    });

    educationsToCreate.forEach((exp) => {
      const data: TResumeEducationCreateWihtoutResume = {
        title: exp.title,
        description: exp.description,
        startYear: exp.startYear,
        startMonth: exp.startMonth,
        endYear: exp.endYear,
        endMonth: exp.endMonth,
        rawPJ: {
          connectOrCreate: {
            where: { name: exp.institutionName },
            create: {
              name: exp.institutionName,
              email: exp.institutionEmail,
              phone: exp.institutionPhone,
              cnpj: exp.institutionCnpj,
              location: exp.institutionLocation,
            },
          },
        },
        certificates: {
          create: exp.certificates.map((certificateId) => ({
            certificate: { connect: { certificateId } },
          })),
        },
      };

      creates.push(data);
    });

    return {
      updates,
      creates,
      deletes: educationsToDelete.map((edu) => ({ resumeEducationId: edu })),
    };
  }

  private mapUpdateLanguages(
    newLanguages: CreateOrUpdateResumeLanguageDto[],
    existingLanguageIds: string[],
  ): {
    updates: TResumeLanguageUpdate[];
    creates: TResumeLanguageCreate[];
    deletes: TResumeLanguageDelete[];
  } {
    if (!newLanguages) return undefined;

    const updates: TResumeLanguageUpdate[] = [];
    const creates: TResumeLanguageCreate[] = [];
    const deletes: TResumeLanguageDelete[] = [];

    const languagesToDelete = existingLanguageIds.filter(
      (lang) => !newLanguages.some((dto) => dto.resumeLanguageId === lang),
    );

    const languagesToUpdate = newLanguages.filter((dto) => existingLanguageIds.includes(dto.resumeLanguageId));

    const languagesToCreate = newLanguages.filter((dto) => !dto.resumeLanguageId);

    languagesToUpdate.forEach((lang) => {
      const data: Prisma.ResumeLanguageUpdateWithoutResumeInput = {
        language: lang.language,
        level: lang.level,
        certificates: {
          deleteMany: {
            resumeLanguageId: lang.resumeLanguageId,
          },
          create: lang.certificates.map((certificateId) => ({
            certificate: { connect: { certificateId } },
          })),
        },
      };
      updates.push({
        where: { resumeLanguageId: lang.resumeLanguageId },
        data,
      });
    });

    languagesToCreate.forEach((lang) => {
      const data: TResumeLanguageCreate = {
        language: lang.language,
        level: lang.level,
        certificates: {
          create: lang.certificates.map((certificateId) => ({
            certificate: { connect: { certificateId } },
          })),
        },
      };
      creates.push(data);
    });

    languagesToDelete.forEach((lang) => {
      deletes.push({ resumeLanguageId: lang });
    });

    return {
      updates,
      creates,
      deletes,
    };
  }

  private getResumePdfData(pf: TPessoaFisicaOutput, resume: TResumeWithDetailsOutput): IResumePdf {
    return {
      profileData: {
        name: pf.nome,
        email: pf.email,
        phone: pf.telefone,
      },
      resume: {
        title: resume.title,
        description: resume.description,
        experiences: resume.experiences.map((e) => {
        return {
          title: e.title,
          company: e.rawPJ.name,
          startDate: `${e.startMonth}/${e.startYear}`,
          endDate: e.endYear && e.endMonth ? `${e.endMonth}/${e.endYear}` : null,
          location: e.rawPJ.location ?? null,
          description: e.description,
        }}),
        educations: resume.education.map((e) => {
        return {
          institution: e.rawPJ.name,
          degree: e.title,
          startDate: `${e.startMonth}/${e.startYear}`,
          endDate: e.endYear && e.endMonth ? `${e.endMonth}/${e.endYear}` : null,
          location: e.rawPJ.location ?? null,
          description: e.description,
        }}),
        languages: resume.languages.map((l) => {
          return {
          language: l.language,
          level: l.level,
        }}),
      },
    }


  }
}
