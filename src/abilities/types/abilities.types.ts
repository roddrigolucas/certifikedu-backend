import { Abilities, Prisma } from '@prisma/client';

export type TAbilitiesCreateInput = Prisma.AbilitiesCreateInput;
export type TAbilitiesWhereInput = Prisma.AbilitiesWhereInput;

export type TAbilitiesUpdateInput = Prisma.AbilitiesUpdateInput;

export type TAbilitiesOutput = Prisma.AbilitiesGetPayload<{}>;

export type TAbilitiesCategoriesOutput = Prisma.AbilitiesGetPayload<{
  select: { tema: true };
}>;

export type TCreateAbilityQuery = Prisma.PrismaPromise<Abilities>;

export type TCategoryMetricsOutput = { tema: string; _count: { tema: number } };

export type TAbilityOnCertificateOutput = Prisma.AbilityOnCertificateGetPayload<{
  include: {habilidade: true}
}>;
