import { Prisma } from "@prisma/client";

export type TPessoaJuridicaOutput = Prisma.PessoaJuridicaGetPayload<{}>;

export type TPessoaFisicaOutput = Prisma.PessoaFisicaGetPayload<{}>;

export type TQueryPromise = Prisma.PrismaPromise<Prisma.BatchPayload>;
