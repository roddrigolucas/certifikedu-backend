import { Injectable } from '@nestjs/common';
import { TQueryPromise } from '../_aux/types/_aux.types';
import { PrismaService } from '../prisma/prisma.service';
import { IAbility, IAbilityInfo } from './interfaces/abilities.interfaces';
import { TAbilityOnReviewCreateInput, TAbilityOnReviewOutput } from './types/abilities-on-review.types';
import {
  TAbilitiesCategoriesOutput,
  TAbilitiesCreateInput,
  TAbilitiesOutput,
  TAbilitiesUpdateInput,
  TAbilitiesWhereInput,
  TAbilityOnCertificateOutput,
  TCategoryMetricsOutput,
} from './types/abilities.types';

@Injectable()
export class AbilitiesService {
  constructor(private readonly prismaService: PrismaService) { }

  //Admin --------------------------------
  async findAbilityOnReview(id: string): Promise<TAbilityOnReviewOutput> {
    return await this.prismaService.abilityOnReview.findUnique({ where: { id: id } });
  }

  async findAbility(id: string): Promise<TAbilitiesOutput> {
    return await this.prismaService.abilities.findUnique({ where: { habilidadeId: id } });
  }

  async upgradeAbilityOnReview(abilityOnReview: TAbilityOnReviewOutput): Promise<TAbilitiesOutput> {
    const abilityInfo: TAbilitiesCreateInput = {
      habilidade: abilityOnReview.habilidade,
      tema: abilityOnReview.tema,
      createdByUser: abilityOnReview?.createdByUser ?? null,
      ownerId: abilityOnReview?.ownerId ?? null,
    };

    const [_, ability] = await this.prismaService.$transaction([
      this.prismaService.abilityOnReview.delete({ where: { id: abilityOnReview.id } }),
      this.prismaService.abilities.create({ data: abilityInfo }),
    ]);

    return ability;
  }

  async deleteAbilityOnReview(abilityOnReviewId: string) {
    await this.prismaService.abilityOnReview.delete({ where: { id: abilityOnReviewId } });
  }

  async updateAbility(abilityId: string, data: TAbilitiesUpdateInput): Promise<TAbilitiesOutput> {
    return await this.prismaService.abilities.update({
      where: { habilidadeId: abilityId },
      data: { ...data },
    });
  }

  async deleteAbility(abilityId: string) {
    await this.prismaService.abilities.delete({ where: { habilidadeId: abilityId } });
  }

  async checkAbility(data: TAbilitiesWhereInput): Promise<TAbilitiesOutput> {
    return await this.prismaService.abilities.findFirst({
      where: data,
    });
  }

  async createAbility(data: TAbilitiesCreateInput): Promise<TAbilitiesOutput> {
    const newAbility = await this.prismaService.abilities.create({
      data: data,
    });

    return newAbility;
  }

  //User --------------------------------
  async getAllEnabledCategories(): Promise<Array<TAbilitiesCategoriesOutput>> {
    const themes = await this.prismaService.abilities.findMany({
      where: { isValid: true },
      select: { tema: true },
      distinct: ['tema'],
    });

    return themes;
  }

  async getAbilitiesByCategory(category: string): Promise<Array<TAbilitiesOutput>> {
    const abilities = await this.prismaService.abilities.findMany({
      where: { tema: category },
    });

    return abilities;
  }

  async getAllEnabledAbilities(): Promise<Array<TAbilitiesOutput>> {
    const abilities = await this.prismaService.abilities.findMany({
      where: { isValid: true },
      orderBy: [{ tema: 'asc' }, { habilidade: 'asc' }],
    });

    return abilities;
  }

  async getAllOnReviewAbilities(): Promise<Array<TAbilityOnReviewOutput>> {
    return this.prismaService.abilityOnReview.findMany();
  }

  async checkAbilityOnReview(data: TAbilityOnReviewCreateInput): Promise<Array<TAbilityOnReviewOutput>> {
    return await this.prismaService.abilityOnReview.findMany({
      where: {
        habilidade: data.habilidade,
        tema: data.tema,
      },
    });
  }

  async createAbilityOnReview(data: TAbilityOnReviewCreateInput): Promise<TAbilityOnReviewOutput> {
    const abilityOnReview = this.prismaService.abilityOnReview.create({
      data: data,
    });

    return abilityOnReview;
  }

  getUpdateUserAbilitiesQuery(userId: string, certificateIds: Array<string>): TQueryPromise {
    return this.prismaService.abilityOnCertificate.updateMany({
      where: { certificateId: { in: certificateIds } },
      data: { userId: userId },
    });
  }

  async getValidAbilitiesIdsByNameOrId(abilities: Array<string>): Promise<Array<string>> {
    return (
      await this.prismaService.abilities.findMany({
        where: { OR: [{ habilidadeId: { in: abilities } }, { habilidade: { in: abilities } }] },
        select: { habilidadeId: true },
      })
    ).map((ability) => ability.habilidadeId);
  }

  async getAbilitiesByIds(abilitiesIds: Array<string>): Promise<Array<TAbilitiesOutput>> {
    return await this.prismaService.abilities.findMany({
      where: { habilidadeId: { in: abilitiesIds } },
    });
  }

  async getAbilitiesByName(abilities: Array<string>): Promise<Array<IAbilityInfo>> {
    return (
      await this.prismaService.abilities.findMany({
        where: { habilidade: { in: abilities } },
      })
    ).map((ability) => {
      return { abilityId: ability.habilidadeId, ability: ability.habilidade };
    });
  }

  async getAbilitiesOnReviewByName(abilities: Array<string>): Promise<Array<IAbilityInfo>> {
    return (
      await this.prismaService.abilityOnReview.findMany({
        where: { habilidade: { in: abilities } },
      })
    ).map((ability) => {
      return { abilityId: ability.id, ability: ability.habilidade };
    });
  }

  // API --------------------------------------------------------------------------------
  async getAllCategoriesMetrics(userId: string): Promise<Array<TCategoryMetricsOutput>> {
    const categories = await this.prismaService.abilities.groupBy({
      by: ['tema'],
      _count: {
        tema: true,
      },
      where: {
        OR: [
          {
            createdByUser: false,
          },
          {
            AND: [{ createdByUser: true }, { ownerId: userId }],
          },
        ],
      },
    });

    return categories;
  }

  async getAbilityByUserAndCategory(category: string, userId: string): Promise<Array<TAbilitiesOutput>> {
    const abilities = await this.prismaService.abilities.findMany({
      where: {
        tema: category,
        OR: [
          {
            createdByUser: false,
          },
          {
            AND: [{ createdByUser: true }, { ownerId: userId }],
          },
        ],
      },
    });

    return abilities;
  }

  async getAbilityById(abilityId: string): Promise<TAbilitiesOutput> {
    const ability = await this.prismaService.abilities.findFirst({
      where: { habilidadeId: abilityId },
    });

    return ability;
  }

  async getUserAbilitiesRecord(userId: string): Promise<Array<TAbilityOnCertificateOutput>> {
    return await this.prismaService.abilityOnCertificate.findMany({
      where: {
        certificate: {
          receptorId: userId,
        },
      },
      include: { habilidade: true },
    });
  }

  async getUserAbilities(userId: string): Promise<Array<IAbility>> {
    const abilities = await this.getUserAbilitiesRecord(userId);

    return Array.from(new Map(abilities.map((ability) => [ability.habilidadeId, ability])).values()).map((ability) => {
      return {
        abilityId: ability.habilidade.habilidadeId,
        ability: ability.habilidade.habilidade,
        category: ability.habilidade.tema,
      };
    });
  }

  async createNewAbilityFromCertificate(userId: string, abilityInfo: IAbility): Promise<string> {
    const findAbility = await this.prismaService.abilities.findFirst({
      where: { tema: abilityInfo.category, habilidade: abilityInfo.ability },
      select: { habilidadeId: true },
    });

    if (findAbility) {
      return findAbility.habilidadeId;
    }

    const newAbility = await this.prismaService.abilities.create({
      data: {
        tema: abilityInfo.category,
        habilidade: abilityInfo.ability,
        createdByUser: true,
        ownerId: userId,
      },
      select: { habilidadeId: true },
    });

    return newAbility.habilidadeId;
  }
}
