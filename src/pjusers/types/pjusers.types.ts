import { Prisma } from '@prisma/client';

export type TPessoaJuridicaWithSociosOutput = Prisma.PessoaJuridicaGetPayload<{
  include: { socios: true };
}>;

export type TPjAdminsWithPfOutput = Prisma.PJAdminsGetPayload<{
  include: { pf: { include: { user: true } } };
}>;

export type TCorporateAdminsWithPfOutput = Prisma.CorporateAdminsGetPayload<{
  include: { pf: { include: { user: true } } };
}>;

export type TPjAdminsWithPjOutput = Prisma.PJAdminsGetPayload<{
  include: { pj: true };
}>;

export type TCorporateAdminsWithPjOutput = Prisma.CorporateAdminsGetPayload<{
  include: { pj: true };
}>;
