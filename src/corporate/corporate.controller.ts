import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JobOpportunityStatus } from '@prisma/client';
import { AuxService } from '../_aux/_aux.service';
import { CertificatesService } from '../certificates/certificates.service';
import { UsersService } from '../users/users.service';
import { JwtGuard } from '../auth/guard';
import { Roles } from '../users/decorators';
import { RolesGuard } from '../users/guards';
import { CorporateService } from './corporate.service';
import { CorporateRoles } from './decorators/corporate-roles.decorator';
import { CreateOrUpdateJobOpportunityDto } from './dtos/corporate-inputs.dto';
import {
  ResponseJobCandidateInfoDto,
  ResponseJobOpportunityDto,
  ResponseProfileCorporateDto,
} from './dtos/corporate-response.dto';
import { CorporateRolesGuard } from './guards/corporate.guard';
import { IJobCandidateResponse } from './interfaces/corporate.interfaces';
import {
  TJobOpportunityAbilitiesWorkFieldsCandidatesOutput,
  TJobOpportunityCreateInput,
  TJobOpportunityUpdateInput,
} from './types/corporate.types';

@ApiTags('Corporate -- Job Opportunity')
@Controller('corporate/:pjId')
@UseGuards(JwtGuard)
export class CorporateController {
  constructor(
    private readonly corporateService: CorporateService,
    private readonly auxService: AuxService,
    private readonly usersService: UsersService,
    private readonly certificatesService: CertificatesService,
  ) {}

  @UseGuards(RolesGuard, CorporateRolesGuard)
  @Roles('enabled')
  @CorporateRoles('basico')
  @Get('profile')
  async getCorporateProfile(@Param('pjId') pjId: string): Promise<ResponseProfileCorporateDto> {
    const jobs = await this.corporateService.getPjJobs(pjId);

    return {
      inProgress: jobs.filter((job) => job.status == JobOpportunityStatus.IN_PROGRESS).length,
      closed: jobs.filter((job) => job.status == JobOpportunityStatus.CLOSED).length,
      jobOpportunities: jobs.map((job) => {
        return {
          jobId: job.jobId,
          status: job.status,
          title: job.title,
          workModel: job.workModel,
          jobOpportunityType: job.type,
          createdAt: job.createdAt,
          candidates: job.recommendedCandidates.length,
          endAt: job?.endAt ?? null,
          jobCode: job.jobCode,
          pcdInfo: job.pcdInfo,
        };
      }),
    };
  }

  @UseGuards(RolesGuard, CorporateRolesGuard)
  @Roles('enabled')
  @CorporateRoles('basico')
  @Post('job-opportunities')
  async createJobOpportunity(
    @Param('pjId') pjId: string,
    @Body() dto: CreateOrUpdateJobOpportunityDto,
  ): Promise<ResponseJobOpportunityDto> {
    const validAbilities = await this.auxService.getValidAbilities(dto.abilities);

    if (validAbilities.length == 0) {
      throw new BadRequestException('Bad Request: Abilities not found.');
    }

    const workFieldsIds = await this.auxService.getValidWorkFieldsIds(dto.workFields);

    if (workFieldsIds.length == 0) {
      throw new BadRequestException('Bad Request: Work Fields not found.');
    }

    const validateText = await this.corporateService.validateJobOpportunityTexts(dto.description, dto.title);

    if (!validateText) {
      throw new ForbiddenException('Job opportunity did not pass profanity check.');
    }

    const jobOpportunityData: TJobOpportunityCreateInput = {
      ...dto,
      pj: { connect: { idPJ: pjId } },
      abilities: { create: validAbilities.map((ability) => ({ habilidadeId: ability.abilityId })) },
      workFields: { create: workFieldsIds.map((field) => ({ workFieldId: field })) },
    };

    if (dto.endAt) {
      jobOpportunityData.endAt = this.auxService.formatDate(dto.endAt);
    }

    const jobOpportunityRecord = await this.corporateService.createJobOpportunityRecord(jobOpportunityData);

    let lambdaCandidatesResponse: Array<IJobCandidateResponse>;
    try {
      lambdaCandidatesResponse = await this.corporateService.createJobOpportunityLambda(jobOpportunityRecord);
    } catch (err) {
      console.log(err)
      await this.corporateService.deleteJobOpportunity(jobOpportunityRecord.jobId);

      throw new ServiceUnavailableException('Unable to search embeddings');
    }

    console.log(lambdaCandidatesResponse)

    await this.corporateService.associateJobOpportunitiesCandidates(
      jobOpportunityRecord.jobId,
      lambdaCandidatesResponse,
    );

    const jobOpportunity = await this.corporateService.getJobOpportunityById(jobOpportunityRecord.jobId);

    return this.getJobOpportunityResponse(jobOpportunity);
  }

  @UseGuards(RolesGuard, CorporateRolesGuard)
  @Roles('enabled')
  @CorporateRoles('basico')
  @Put('job-opportunities/:jobId')
  async editJobOpportunity(
    @Param('pjId') pjId: string,
    @Param('jobId') jobId: string,
    @Body() dto: CreateOrUpdateJobOpportunityDto,
  ): Promise<ResponseJobOpportunityDto> {
    const jobOpportunityInfo = await this.corporateService.getJobOpportunityById(jobId);

    if (!jobOpportunityInfo) {
      throw new NotFoundException('Job Opportunity not found.');
    }

    if (jobOpportunityInfo.pjId != pjId) {
      throw new ForbiddenException('This user does not own this Job Opportunity');
    }

    const validAbilities = await this.auxService.getValidAbilities(dto.abilities);

    if (validAbilities.length == 0) {
      throw new BadRequestException('Bad Request: Abilities not found.');
    }

    const workFieldsIds = await this.auxService.getValidWorkFieldsIds(dto.workFields);

    if (workFieldsIds.length == 0) {
      throw new BadRequestException('Bad Request: Work Fields not found.');
    }

    const validateText = await this.corporateService.validateJobOpportunityTexts(dto.description, dto.title);

    if (!validateText) {
      throw new ForbiddenException('Job opportunity did not pass profanity check.');
    }

    const data: TJobOpportunityUpdateInput = {
      ...dto,
      abilities: { create: validAbilities.map((ability) => ({ habilidadeId: ability.abilityId })) },
      workFields: { create: workFieldsIds.map((field) => ({ workFieldId: field })) },
    };

    const jobOpportunityRecord = await this.corporateService.editJobOpportunity(jobOpportunityInfo.jobId, data);

    const lambdaCandidatesResponse = await this.corporateService.createJobOpportunityLambda(jobOpportunityInfo);

    await this.corporateService.associateJobOpportunitiesCandidates(
      jobOpportunityRecord.jobId,
      lambdaCandidatesResponse,
    );

    const jobOpportunity = await this.corporateService.getJobOpportunityById(jobId);

    return this.getJobOpportunityResponse(jobOpportunity);
  }

  @UseGuards(RolesGuard, CorporateRolesGuard)
  @Roles('enabled')
  @CorporateRoles('basico')
  @Delete('job-opportunities/:jobId')
  async deleteJobOpportunity(
    @Param('pjId') pjId: string,
    @Param('jobId') jobId: string,
  ): Promise<{ success: boolean }> {
    const jobOpportunityInfo = await this.corporateService.getJobOpportunityById(jobId);

    if (!jobOpportunityInfo) {
      throw new NotFoundException('Job Opportunity not found.');
    }

    if (jobOpportunityInfo.pjId != pjId) {
      throw new ForbiddenException('This user does not own this Job Opportunity');
    }

    await this.corporateService.deleteJobOpportunity(jobOpportunityInfo.jobId);

    return { success: true };
  }

  @UseGuards(RolesGuard, CorporateRolesGuard)
  @Roles('enabled')
  @CorporateRoles('basico')
  @Get('job-opportunities/:jobId')
  async getJobOpportunity(
    @Param('pjId') pjId: string,
    @Param('jobId') jobId: string,
  ): Promise<ResponseJobOpportunityDto> {
    const jobOpportunity = await this.corporateService.getJobOpportunityById(jobId);

    if (!jobOpportunity) {
      throw new NotFoundException('Job Opportunity not found.');
    }

    if (jobOpportunity.pjId != pjId) {
      throw new ForbiddenException('This user does not own this Job Opportunity');
    }

    return this.getJobOpportunityResponse(jobOpportunity);
  }

  @UseGuards(RolesGuard, CorporateRolesGuard)
  @Roles('enabled')
  @CorporateRoles('basico')
  @Patch('job-opportunities/candidates/:jobId')
  async refreshJobCandidates(
    @Param('pjId') pjId: string,
    @Param('jobId') jobId: string,
  ): Promise<ResponseJobOpportunityDto> {
    const jobOpportunityInfo = await this.corporateService.getJobOpportunityById(jobId);

    if (jobOpportunityInfo.pjId !== pjId) {
      throw new ForbiddenException('This user does not own this job');
    }

    const jobOpportunity = await this.corporateService.refreshJobCandidates(jobOpportunityInfo.jobId);

    return this.getJobOpportunityResponse(jobOpportunity);
  }

  @UseGuards(RolesGuard, CorporateRolesGuard)
  @Roles('enabled')
  @CorporateRoles('basico')
  @Get('job-opportunities/:jobId/candidates/:idPf')
  async getCandidateInformation(
    @Param('pjId') pjId: string,
    @Param('jobId') jobId: string,
    @Param('idPf') idPf: string,
  ): Promise<ResponseJobCandidateInfoDto> {
    const jobOpportunity = await this.corporateService.getJobOpportunityById(jobId);

    if (!jobOpportunity) {
      throw new NotFoundException('Job opportunity Not Found');
    }

    if (jobOpportunity.pjId !== pjId) {
      throw new ForbiddenException('This user does not own this job opportunity');
    }

    if (!jobOpportunity.recommendedCandidates.map((candidate) => candidate.idPF).includes(idPf)) {
      throw new ForbiddenException('This user is not a candidate job opportunity');
    }

    const pf = await this.usersService.getUserByPfId(idPf);

    if (!pf) {
      throw new NotFoundException('User Not Found');
    }

    const profile = await this.corporateService.getCandidateProfessionalProfile(idPf);

    if (!profile) {
      throw new NotFoundException('Professional Profile Not Found');
    }

    const userCertificates = await this.certificatesService.getCandidateCertificatesById(pf.id);

    return {
      id: profile.id,
      firstName: pf.pessoaFisica.nome.split(' ').at(0),
      description: profile.description,
      state: profile.state,
      city: profile.city,
      yearsOfExperience: profile.yearsOfExperience,
      isPcd: profile.isPcd,
      seniorityLevel: profile.seniorityLevel,
      educationLevel: profile.educationLevel,
      workModel: profile.workModel,
      opportunityType: profile.opportunityType,
      openToWork: profile.openToWork,
      workFields: profile.workFields.map((wf) => {
        return wf.workField.workField;
      }),
      abilities: profile.usedAbilities.map((ability) => {
        return {
          ability: ability.abilities.habilidade,
          category: ability.abilities.tema,
        };
      }),
      certificates: userCertificates.map((certificate) => {
        const selfEmmited = certificate.emissorId === pf.id;
        return {
          issuerName: selfEmmited ? null : certificate.emissorName,
          name: certificate.name,
          hoursWorkload: certificate.cargaHoraria,
          categories: certificate.habilidades.map((ability) => ability.habilidade.tema),
          certificateImage: certificate.certificatePicture,
          issuedAt: certificate?.issuedAt ?? certificate.createdAt,
          expiresAt: certificate?.expiresAt ?? null,
          isSelfEmmited: selfEmmited,
        };
      }),
    };
  }

  private getJobOpportunityResponse(
    jobOpportunity: TJobOpportunityAbilitiesWorkFieldsCandidatesOutput,
  ): ResponseJobOpportunityDto {
    return {
      status: jobOpportunity.status,
      createdAt: jobOpportunity.createdAt,
      updatedAt: jobOpportunity.updatedAt,
      title: jobOpportunity.title,
      description: jobOpportunity.description,
      workModel: jobOpportunity.workModel,
      abilities: jobOpportunity.abilities.map((ability) => {
        return { ability: ability.ability.habilidade, category: ability.ability.tema };
      }),
      jobOpportunityType: jobOpportunity.type,
      workFields: jobOpportunity.workFields.map((field) => field.workField.workField),
      endAt: jobOpportunity?.endAt,
      city: jobOpportunity?.city,
      state: jobOpportunity?.state,
      minimumExperienceLevel: jobOpportunity?.minimumExperienceLevel,
      maximumExperienceLevel: jobOpportunity?.maximumExperienceLevel,
      minimumSalaryRange: jobOpportunity?.minimumSalaryRange,
      maximumSalaryRange: jobOpportunity?.maximumSalaryRange,
      seniorityLevel: jobOpportunity?.seniorityLevel,
      educationLevel: jobOpportunity.educationLevel,
      candidatesNumber: jobOpportunity.recommendedCandidates.length,
      jobCode: jobOpportunity.jobCode,
      pcdInfo: jobOpportunity.pcdInfo,
      candidates: jobOpportunity.recommendedCandidates.map((candidate) => {
        return {
          id: candidate.idPF,
          name: candidate.pf.nome,
          matchScore: candidate.matchLevel,
          generalScore: candidate.generalMatch,
          AbilitiesScore: candidate.abilitiesMatch,
        };
      }),
    };
  }
}
