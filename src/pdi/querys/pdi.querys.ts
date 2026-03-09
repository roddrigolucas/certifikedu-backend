import { Prisma } from '@prisma/client';

export const listPdiQuery = Prisma.validator<Prisma.PdiSelect>()({
  pdiId: true,
  createdAt: true,
  title: true,
  status: true,
  progressPercentage: true,
  nodes: { orderBy: { createdAt: 'asc' } },
});

export const pdiWithNodes = Prisma.validator<Prisma.PdiSelect>()({
  pdiId: true,
  title: true,
  progressPercentage: true,
  status: true,
  createdAt: true,
  nodes: {
    orderBy: { createdAt: 'asc' },
    select: {
      nodeId: true,
      objective: true,
      description: true,
      markedAsFinished: true,
      books: {
        select: {
          book: {
            select: {
              title: true,
              authorName: true,
              bookId: true,
            },
          },
        },
      },
      abilities: {
        select: {
          ability: {
            select: {
              habilidade: true,
              tema: true,
              habilidadeId: true,
            },
          },
        },
      },
      abilitiesOnReview: {
        select: {
          abilityOnReview: {
            select: {
              habilidade: true,
              tema: true,
              id: true,
            },
          },
        },
      },
    },
  },
});
