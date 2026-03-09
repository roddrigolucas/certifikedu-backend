import { Injectable } from '@nestjs/common';
import { ILambdaValidateText } from 'src/requests/requests.interfaces';
import { AbilitiesService } from '../abilities/abilities.service';
import { IAbilityNewJob } from '../abilities/interfaces/abilities.interfaces';
import { AuxService } from '../aux/aux.service';
import { TQueryPromise } from '../aux/types/aux.types';
import { PrismaService } from '../prisma/prisma.service';
import { RequestsService } from '../requests/requests.service';
import { IProfessionalProfileLambda, IUpdateProfileAbilitiesLambda } from './interfaces/candidate.interfaces';
import {
  TPessoaFisicaWithProfileAndOpportunitiesOutput,
  TProfessionalProfileCreateInput,
  TProfessionalProfileUpdateInput,
  TProfessionalProfileWithFieldsAndAbilitiesOutput,
} from './types/candidate.types';

@Injectable()
export class CandidateService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly requestService: RequestsService,
    private readonly auxService: AuxService,
    private readonly abilitiesService: AbilitiesService,
  ) {}

  async getCandidateProfessionalProfile(idPf: string): Promise<TProfessionalProfileWithFieldsAndAbilitiesOutput> {
    return await this.prismaService.professionalProfile.findUnique({
      where: { idPF: idPf },
      include: {
        usedAbilities: { include: { abilities: true } },
        workFields: { include: { workField: true } },
      },
    });
  }

  async getCandidateOpportunitiesRecords(userId: string): Promise<TPessoaFisicaWithProfileAndOpportunitiesOutput> {
    return await this.prismaService.pessoaFisica.findUnique({
      where: { userId: userId },
      include: {
        professionalProfile: true,
        jobOpportunities: { include: { jobOpportunity: true } },
      },
    });
  }

  async deleteCandidateProfessionalProfileRecord(profileId: string) {
    await this.prismaService.professionalProfile.delete({
      where: { id: profileId },
    });
  }

  deleteProfessionalProfileAbilitiesQuerys(profileId: string): TQueryPromise {
    return this.prismaService.abilitiesOnProfessionalProfile.deleteMany({
      where: { professionalProfileId: profileId },
    });
  }

  deleteProfessionalProfileWorkFieldsQuerys(profileId: string): TQueryPromise {
    return this.prismaService.workFieldOnProfessionalProfile.deleteMany({
      where: { professionalProfileId: profileId },
    });
  }

  async removeCandidateFromJobOpportunities(idPf: string) {
    await this.prismaService.pessoaFisicaOnJobOpportunity.deleteMany({
      where: { idPF: idPf },
    });
  }

  async createCandidateProfessionalProfileRecord(
    data: TProfessionalProfileCreateInput,
  ): Promise<TProfessionalProfileWithFieldsAndAbilitiesOutput> {
    return await this.prismaService.professionalProfile.create({
      data: data,
      include: {
        usedAbilities: { include: { abilities: true } },
        workFields: { include: { workField: true } },
      },
    });
  }

  async updateCandidateProfessionalProfileRecord(
    profileId: string,
    data: TProfessionalProfileUpdateInput,
  ): Promise<TProfessionalProfileWithFieldsAndAbilitiesOutput> {
    const deleteAbilitiesQuery = this.deleteProfessionalProfileAbilitiesQuerys(profileId);
    const deleteWorkFieldsQuery = this.deleteProfessionalProfileAbilitiesQuerys(profileId);
    const profileQuery = this.prismaService.professionalProfile.update({
      where: { id: profileId },
      data: data,
      include: {
        usedAbilities: { include: { abilities: true } },
        workFields: { include: { workField: true } },
      },
    });

    const [_, __, profile] = await this.prismaService.$transaction([
      deleteAbilitiesQuery,
      deleteWorkFieldsQuery,
      profileQuery,
    ]);

    return profile;
  }

  async updateCandidateAbilitiesOnProfessionalProfile(profileId: string, abilities: Array<string>) {
    const deleteAbilitiesQuery = this.deleteProfessionalProfileAbilitiesQuerys(profileId);
    const profileQuery = this.prismaService.professionalProfile.update({
      where: { id: profileId },
      data: {
        usedAbilities: {
          create: abilities.map((abilityId) => {
            return { abilityId: abilityId };
          }),
        },
      },
    });

    await this.prismaService.$transaction([deleteAbilitiesQuery, profileQuery]);
  }

  async createProfessionalProfileLambda(
    profile: TProfessionalProfileWithFieldsAndAbilitiesOutput,
    userId: string,
  ): Promise<{ success: boolean }> {
    const lambdaProfile: IProfessionalProfileLambda = {
      mode: 'save_user',
      user_id: profile.idPF,
      description: profile.description,
      categories: profile.workFields.map((wf) => wf.workField.workField),
    };

    const updated_abilities = await this.updateUserAbilitiesOnProfile(userId);

    await Promise.all([
      this.requestService.createProfessionalProfileLamdba(lambdaProfile),
      this.requestService.updateProfileAbilitiesLambda(updated_abilities),
    ]);

    return { success: true };
  }

  async validateProfileTextsFields(description: string): Promise<boolean> {
    const data: ILambdaValidateText = { texts: { description: description } };

    return await this.requestService.getApproveText(data);
  }

  private getNewAbilitiesIds(newAbilities: Set<IAbilityNewJob>, usedAbilities: Set<IAbilityNewJob>): Array<string> {
    const newAbilitiesIds: Array<string> = [];

    for (const item of newAbilities) {
      if (!usedAbilities.has(item)) {
        newAbilitiesIds.push(item.abilityId);
      }
    }

    return newAbilitiesIds;
  }

  async updateUserAbilitiesOnProfile(userId: string): Promise<IUpdateProfileAbilitiesLambda> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      return null
    }
    
    const profile = await this.getCandidateProfessionalProfile(pf.idPF);

    if (!profile) {
      return null;
    }

    const abilities: Array<IAbilityNewJob> = (await this.abilitiesService.getUserAbilities(userId)).map((ability) => ({
      abilityId: ability.abilityId,
      ability: ability.ability,
    }));

    const usedAbilities: Array<IAbilityNewJob> = profile.usedAbilities.map((ability) => ({
      abilityId: ability.abilityId,
      ability: ability.abilities.habilidade,
    }));

    const newAbilityIds = this.getNewAbilitiesIds(new Set(abilities), new Set(usedAbilities));

    if (newAbilityIds.length === 0) {
      return null;
    }

    await this.updateCandidateAbilitiesOnProfessionalProfile(profile.id, newAbilityIds);

    const lambdaData: IUpdateProfileAbilitiesLambda = {
      userId: pf.idPF,
      abilities: abilities
        .filter((ability) => newAbilityIds.includes(ability.abilityId))
        .map((ability) => {
          return {
            abilityId: ability.abilityId,
            ability: ability.ability,
          };
        }),
    };

    return lambdaData;
  }
}
