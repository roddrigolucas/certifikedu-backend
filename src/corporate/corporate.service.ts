import { Injectable } from '@nestjs/common';
import { ILambdaValidateText } from 'src/requests/requests.interfaces';
import { TQueryPromise } from '../_aux/types/_aux.types';
import {
  TProfessionalProfileWithFieldsAndAbilitiesOutput,
  TProfessionalProfileWithOnlyIdsOutput,
} from '../candidate/types/candidate.types';
import { PrismaService } from '../prisma/prisma.service';
import { RequestsService } from '../requests/requests.service';
import { IJobCandidateResponse, INewJobLambda } from './interfaces/corporate.interfaces';
import {
  TJobOpportunityAbilitiesWorkFieldsCandidatesOutput,
  TJobOpportunityCreateInput,
  TJobOpportunityUpdateInput,
  TJobOpportunityWithaAbilitiesAndWorkFieldsOutput,
  TJobOpportunityWithCandidatesOutput,
} from './types/corporate.types';

@Injectable()
export class CorporateService {
  constructor(private readonly prismaService: PrismaService, private readonly requestService: RequestsService) {}

  async getPjJobs(pjId: string): Promise<Array<TJobOpportunityWithCandidatesOutput>> {
    return await this.prismaService.jobOpportunity.findMany({
      where: { pjId: pjId },
      include: { recommendedCandidates: true },
    });
  }

  async getJobOpportunityById(jobOpportunityId: string): Promise<TJobOpportunityAbilitiesWorkFieldsCandidatesOutput> {
    return await this.prismaService.jobOpportunity.findUnique({
      where: { jobId: jobOpportunityId },
      include: {
        abilities: { include: { ability: true } },
        workFields: { include: { workField: true } },
        recommendedCandidates: { include: { pf: true } },
      },
    });
  }

  async createJobOpportunityRecord(
    data: TJobOpportunityCreateInput,
  ): Promise<TJobOpportunityWithaAbilitiesAndWorkFieldsOutput> {
    return await this.prismaService.jobOpportunity.create({
      data: data,
      include: {
        abilities: { include: { ability: true } },
        workFields: { include: { workField: true } },
      },
    });
  }

  getDeleteAbilitiesFromJobQuery(jobId: string): TQueryPromise {
    return this.prismaService.abilityOnJobOpportunity.deleteMany({
      where: { jobId: jobId },
    });
  }

  getDeleteWorkFieldsFromJobQuery(jobId: string): TQueryPromise {
    return this.prismaService.workFieldOnJobOpportunity.deleteMany({
      where: { jobOpportunityId: jobId },
    });
  }

  getDeleteCandidatesFromJobQuery(jobId: string): TQueryPromise {
    return this.prismaService.pessoaFisicaOnJobOpportunity.deleteMany({
      where: { jobId: jobId },
    });
  }

  async associateJobOpportunitiesCandidates(
    jobOpportunityId: string,
    candidates: Array<IJobCandidateResponse>,
  ): Promise<TJobOpportunityWithCandidatesOutput> {
    const validCandidates = await this.filterValidCandidatesFromLambda(candidates);

    return await this.prismaService.jobOpportunity.update({
      where: { jobId: jobOpportunityId },
      data: {
        recommendedCandidates: {
          create: validCandidates.map((candidate) => {
            return {
              idPF: candidate.user_id,
              matchLevel: 0,
              abilitiesMatch: candidate.abilities_score,
              generalMatch: candidate.general_score,
            };
          }),
        },
      },
      include: { recommendedCandidates: true },
    });
  }

  async deleteJobOpportunity(jobId: string) {
    await this.prismaService.jobOpportunity.delete({
      where: { jobId: jobId },
    });
  }

  async createJobOpportunityLambda(
    data: TJobOpportunityWithaAbilitiesAndWorkFieldsOutput,
  ): Promise<Array<IJobCandidateResponse>> {
    const lambdaData: INewJobLambda = {
      mode: 'search',
      abilities: data.abilities.map((ability) => {
        return {
          ability: ability.ability.habilidade,
          abilityId: ability.ability.habilidadeId,
        };
      }),
      categories: data.workFields.map((wf) => wf.workField.workField),
      description: data.description,
    };

    return await this.requestService.jobOpportunityLambda(lambdaData);
  }

  async getCandidateProfessionalProfile(idPf: string): Promise<TProfessionalProfileWithFieldsAndAbilitiesOutput> {
    return await this.prismaService.professionalProfile.findUnique({
      where: { idPF: idPf },
      include: {
        usedAbilities: { include: { abilities: true } },
        workFields: { include: { workField: true } },
      },
    });
  }

  async getCandidatesProfessionalProfile(
    candidatesIds: Array<string>,
  ): Promise<Array<TProfessionalProfileWithOnlyIdsOutput>> {
    return await this.prismaService.professionalProfile.findMany({
      where: { AND: [{ idPF: { in: candidatesIds } }, { openToWork: true }] },
      select: { idPF: true },
    });
  }

  async filterValidCandidatesFromLambda(
    candidates: Array<IJobCandidateResponse>,
  ): Promise<Array<IJobCandidateResponse>> {
    const candidateIds = candidates.map((candidate) => candidate.user_id);

    const professionalProfileIds = (await this.getCandidatesProfessionalProfile(candidateIds)).map((id) => id.idPF);

    const validIds = candidateIds.filter((candidateId) => professionalProfileIds.includes(candidateId));

    return candidates.filter((candidate) => validIds.includes(candidate.user_id));
  }

  async editJobOpportunity(
    jobId: string,
    data: TJobOpportunityUpdateInput,
  ): Promise<TJobOpportunityWithaAbilitiesAndWorkFieldsOutput> {
    const jobOpportunityQuery = this.prismaService.jobOpportunity.update({
      where: { jobId: jobId },
      data: data,
      include: {
        abilities: { include: { ability: true } },
        workFields: { include: { workField: true } },
      },
    });

    const [_, __, ___, jobOpportunity] = await this.prismaService.$transaction([
      this.getDeleteAbilitiesFromJobQuery(jobId),
      this.getDeleteWorkFieldsFromJobQuery(jobId),
      this.getDeleteCandidatesFromJobQuery(jobId),
      jobOpportunityQuery,
    ]);

    return jobOpportunity;
  }

  async validateJobOpportunityTexts(description: string, title: string): Promise<boolean> {
    const data: ILambdaValidateText = {
      texts: {
        description: description,
        title: title,
      },
    };

    return await this.requestService.getApproveText(data);
  }

  async refreshJobCandidates(jobId: string): Promise<TJobOpportunityAbilitiesWorkFieldsCandidatesOutput> {
    //const candidatesLambda = await this.requestService.refreshJobCandidates({ jobId: jobId });
    //
    //const validCandidates = await this.filterValidCandidatesFromLambda(candidatesLambda)
    //
    //const candidatesData: Array<TPessoaFisicaOnJobOpportunityCreateManyInput> = validCandidates.map((candidate) => {
    //  return {
    //    idPF: candidate.id,
    //    jobId: jobId,
    //    matchLevel: candidate.matchScore,
    //  };
    //});
    //
    //const connectQuery = this.prismaService.pessoaFisicaOnJobOpportunity.createMany({
    //  data: candidatesData,
    //});
    //
    //await this.prismaService.$transaction([this.getDeleteCandidatesFromJobQuery(jobId), connectQuery]);
    //
    //return await this.getJobOpportunityById(jobId);
    return null;
  }
}
