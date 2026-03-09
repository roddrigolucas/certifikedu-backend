import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbilitiesService } from 'src/abilities/abilities.service';
import { PdiStatus } from '@prisma/client';
import { TPdiCreateInput, TPdiOutput, TPdiWithNodesOutput } from './types/pdi.types';
import { listPdiQuery, pdiWithNodes } from './querys/pdi.querys';
import { IPdiNodeAbilities, IPdiNodeBooks, IPdiStepInfo } from './interfaces/pdi.interface';

@Injectable()
export class PdiService {
  constructor(private readonly prismaService: PrismaService, private readonly abilitiesService: AbilitiesService) {}

  async getPdi(pdiId: string): Promise<TPdiWithNodesOutput> {
    return await this.prismaService.pdi.findUnique({
      where: { pdiId },
      select: pdiWithNodes,
    });
  }

  async createPdi(data: TPdiCreateInput): Promise<TPdiWithNodesOutput> {
    return await this.prismaService.pdi.create({
      data: data,
      select: pdiWithNodes,
    });
  }

  async listPdi(userId: string): Promise<Array<TPdiOutput>> {
    return await this.prismaService.pdi.findMany({
      where: { idPF: userId },
      select: listPdiQuery,
    });
  }

  async deletePdi(pdiId: string) {
    return this.prismaService.pdi.delete({
      where: { pdiId: pdiId },
    });
  }

  async updatePdiStatusById(pdiId: string, status: PdiStatus) {
    return this.prismaService.pdi.update({
      where: { pdiId: pdiId },
      data: { status: status },
    });
  }

  async updatePdiNode(nodeId: string, finished: boolean) {
    return this.prismaService.pdiNode.update({
      where: { nodeId },
      data: {
        markedAsFinished: finished,
      },
      select: { pdiId: true },
    });
  }

  async createPdiNodeAbilities(
    nodeId: string,
    abilities: Array<IPdiNodeAbilities>,
  ): Promise<{ abilities: Array<string>; abilityOnReview: Array<string> }> {
    const abilitiesNames = abilities.map((ability) => ability.habilidade);
    const existingAbilities = await this.abilitiesService.getAbilitiesByName(abilitiesNames);
    const existingAbilitiesOnReview = await this.abilitiesService.getAbilitiesOnReviewByName(abilitiesNames);

    const newAbilitiesIds = await Promise.all(
      abilities
        .filter(
          (ability) =>
            ![...existingAbilities, ...existingAbilitiesOnReview].map((ab) => ab.ability).includes(ability.habilidade),
        )
        .map(async (ability) => {
          const abilityOnReview = await this.abilitiesService.createAbilityOnReview({
            habilidade: ability.habilidade,
            tema: 'Gerada pelo PDI',
          });

          console.log(abilityOnReview.habilidade, abilityOnReview.id, nodeId);
          return { abilityId: abilityOnReview.id };
        })
        .filter((id) => id),
    );

    await this.prismaService.pdiNode.update({
      where: { nodeId: nodeId },
      data: {
        abilities: {
          createMany: {
            data: existingAbilities.map((ability) => {
              return { abilityId: ability.abilityId };
            }),
          },
        },
        abilitiesOnReview: {
          createMany: {
            data: [...newAbilitiesIds, ...existingAbilitiesOnReview].map((ability) => {
              return { abilityOnReviewId: ability.abilityId };
            }),
          },
        },
      },
    });

    return {
      abilities: existingAbilities.map((ab) => ab.abilityId),
      abilityOnReview: [...existingAbilitiesOnReview, ...newAbilitiesIds].map((ab) => ab.abilityId),
    };
  }

  async createPdiNodeBooks(
    nodeId: string,
    abilitiesIds: Array<string>,
    abilityOnReviewIds: Array<string>,
    book: IPdiNodeBooks,
  ) {
    const existingBook = await this.prismaService.books.findFirst({
      where: { authorName: book.authorName, title: book.title },
      select: { bookId: true },
    });

    if (existingBook) {
      await this.prismaService.books.update({
        where: { bookId: existingBook.bookId },
        data: {
          nodes: { create: { nodeId: nodeId } },
          abilities: {
            createMany: {
              data: abilitiesIds.map((id) => {
                return { abilityId: id };
              }),
            },
          },
          abilitiesOnReview: {
            createMany: {
              data: abilitiesIds.map((id) => {
                return { abilityOnReviewId: id };
              }),
            },
          },
        },
      });

      return null;
    }

    await this.prismaService.books.create({
      data: {
        authorName: book.authorName,
        description: book.description,
        title: book.title,
        nodes: {
          create: {
            nodeId: nodeId,
          },
        },
        abilities: {
          createMany: {
            data: abilitiesIds.map((id) => {
              return { abilityId: id };
            }),
          },
        },
        abilitiesOnReview: {
          createMany: {
            data: abilityOnReviewIds.map((id) => {
              return { abilityOnReviewId: id };
            }),
          },
        },
      },
    });
  }

  async createPdiNodes(pdiId: string, steps: Array<IPdiStepInfo>) {
    for (let step of steps) {
      const node = await this.prismaService.pdiNode.create({
        data: {
          pdiId: pdiId,
          objective: step.description.stepObjective,
          description: step.description.completeDescriptionOfWhatToDo,
        },
        select: { nodeId: true },
      });

      const abilitiesIds = await this.createPdiNodeAbilities(node.nodeId, step.abilities);

      await this.createPdiNodeBooks(node.nodeId, abilitiesIds.abilities, abilitiesIds.abilityOnReview, step.books);
    }
  }
}
