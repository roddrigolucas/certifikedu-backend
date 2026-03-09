import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Post,
  Put,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AbilitiesService } from '../abilities/abilities.service';
import { AuxService } from '../aux/aux.service';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { Roles } from '../users/decorators';
import { RolesGuard } from '../users/guards';
import { CandidateService } from './candidate.service';
import { CreateOrUpdateCandidateProfessionalProfileDto } from './dtos/candidate-inputs.dto';
import {
  ResponseCandidateOpportunitiesDto,
  ResponseCandidateProfessionalProfileDto,
} from './dtos/candidate-response.dto';
import {
  TProfessionalProfileCreateInput,
  TProfessionalProfileUpdateInput,
  TProfessionalProfileWithFieldsAndAbilitiesOutput,
} from './types/candidate.types';

@ApiTags('PF  -- Professional Profile')
@Controller('professional-profile/')
@UseGuards(JwtGuard, RolesGuard)
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly auxService: AuxService,
    private readonly abilitiesService: AbilitiesService,
  ) {}

  @Roles('enabled')
  @Get()
  async getCandidateProfessionalProfile(
    @GetUser('id') userId: string,
  ): Promise<ResponseCandidateProfessionalProfileDto> {
    const pf = await this.auxService.getPfInfo(userId);

    const profile = await this.candidateService.getCandidateProfessionalProfile(pf.idPF);

    if (!profile) {
      throw new NotFoundException('Professional Profile Not Found');
    }

    return this.getProfessionalProfileResponse(profile, pf.nome.split(' ').slice(0).join());
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Post()
  async createCandidateProfessionalProfile(
    @GetUser('id') userId: string,
    @Body() dto: CreateOrUpdateCandidateProfessionalProfileDto,
    // ): Promise<ResponseCandidateProfessionalProfileDto> {
  ): Promise<{ success: boolean }> {
    const pf = await this.auxService.getPfInfo(userId);

    const profileInfo = await this.candidateService.getCandidateProfessionalProfile(pf.idPF);

    if (profileInfo) {
      throw new BadRequestException('This user Already has an professional profile');
    }

    const candidateAbilities = await this.abilitiesService.getUserAbilities(userId);

    const validWorkFieldsIds = await this.auxService.getValidWorkFieldsIds(dto.workFields);

    const validateResponse = await this.candidateService.validateProfileTextsFields(dto.description);

    if (!validateResponse) {
      throw new ForbiddenException('Description did not pass profanity check');
    }

    const profileData: TProfessionalProfileCreateInput = {
      ...dto,
      openToWork: dto?.openToWork ?? true,
      pf: { connect: { idPF: pf.idPF } },
      workFields: {
        create: validWorkFieldsIds.map((wf) => {
          return { workFieldId: wf };
        }),
      },
      usedAbilities: {
        create: candidateAbilities.map((ability) => {
          return { abilityId: ability.abilityId };
        }),
      },
    };

    const profile = await this.candidateService.createCandidateProfessionalProfileRecord(profileData);

    try {
      await this.candidateService.createProfessionalProfileLambda(profile, pf.userId);
    } catch (err) {
      await this.candidateService.deleteCandidateProfessionalProfileRecord(profile.id);
      throw new ServiceUnavailableException('Unable to create Professional Profile Embeddings');
    }

    return { success: true };
  }

  @Roles('enabled')
  @Put()
  async updateCandidateProfessionalProfile(
    @GetUser('id') userId: string,
    @Body() dto: CreateOrUpdateCandidateProfessionalProfileDto,
  ): Promise<ResponseCandidateProfessionalProfileDto> {
    const pf = await this.auxService.getPfInfo(userId);

    const profileInfo = await this.candidateService.getCandidateProfessionalProfile(pf.idPF);

    if (!profileInfo) {
      throw new NotFoundException('Professional Profile Not Found');
    }

    if (profileInfo.idPF != pf.idPF) {
      throw new ForbiddenException('User does not own this profile');
    }

    const validateResponse = await this.candidateService.validateProfileTextsFields(dto.description);

    if (!validateResponse) {
      throw new ForbiddenException('Description did not pass profanity check');
    }

    const candidateAbilities = await this.abilitiesService.getUserAbilities(userId);

    const validWorkFieldsIds = await this.auxService.getValidWorkFieldsIds(dto.workFields);

    if (dto?.openToWork === true) {
      await this.candidateService.removeCandidateFromJobOpportunities(pf.idPF);
    }

    const profileData: TProfessionalProfileUpdateInput = {
      ...dto,
      pf: { connect: { idPF: pf.idPF } },
      workFields: {
        create: validWorkFieldsIds.map((wf) => {
          return { workFieldId: wf };
        }),
      },
      usedAbilities: {
        create: candidateAbilities.map((ability) => {
          return { abilityId: ability.abilityId };
        }),
      },
    };

    const profile = await this.candidateService.updateCandidateProfessionalProfileRecord(profileInfo.id, profileData);

    await this.candidateService.createProfessionalProfileLambda(profile, pf.idPF);

    return this.getProfessionalProfileResponse(profile, pf.nome.split(' ').slice(0).join());
  }

  @Roles('enabled')
  @Delete()
  async deleteCandidateProfessionalProfile(@GetUser('id') userId: string): Promise<{ success: boolean }> {
    const pf = await this.auxService.getPfInfo(userId);

    const profileInfo = await this.candidateService.getCandidateProfessionalProfile(pf.idPF);

    if (!profileInfo) {
      throw new NotFoundException('Professional Profile Not Found');
    }

    if (profileInfo.idPF != pf.idPF) {
      throw new ForbiddenException('User does not own this profile');
    }

    await this.candidateService.deleteCandidateProfessionalProfileRecord(profileInfo.id);

    return { success: true };
  }

  @Roles('enabled')
  @Get('opportunities')
  async getCandidateOpportunities(@GetUser('id') userId: string): Promise<ResponseCandidateOpportunitiesDto> {
    const pf = await this.candidateService.getCandidateOpportunitiesRecords(userId);

    if (!pf.professionalProfile) {
      throw new NotFoundException('Professional Profile Not Found');
    }

    return {
      opportunities: pf.jobOpportunities.map((job) => {
        const op = job.jobOpportunity;
        return {
          status: op.status,
          title: op.title,
          workModel: op.workModel,
          jobOpportunityType: op.type,
        };
      }),
    };
  }

  private getProfessionalProfileResponse(
    profile: TProfessionalProfileWithFieldsAndAbilitiesOutput,
    firstName: string,
  ): ResponseCandidateProfessionalProfileDto {
    return {
      id: profile.id,
      firstName: firstName,
      description: profile.description,
      state: profile.state,
      city: profile.city,
      yearsOfExpirience: profile.yearsOfExperience,
      seniorityLevel: profile.seniorityLevel,
      educationLevel: profile.educationLevel,
      workModel: profile.workModel,
      opportunityType: profile.opportunityType,
      openToWork: profile.openToWork,
      isPcd: profile.isPcd,
      workFields: profile.workFields.map((wf) => wf.workField.workField),
      abilities: profile.usedAbilities.map((ability) => {
        return {
          abilityId: ability.abilities.habilidadeId,
          ability: ability.abilities.habilidade,
          category: ability.abilities.tema,
        };
      }),
    };
  }
}
