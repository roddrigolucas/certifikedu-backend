import { Prisma } from "@prisma/client";


export type TUserCreateInput = Prisma.UserCreateInput;

export type TPessoaFisicaCreateWoUserInput = Prisma.PessoaFisicaCreateWithoutUserInput;

export type TPessoaJuridicaCreateWoUserInput = Prisma.PessoaJuridicaCreateWithoutUserInput;

export type TSocioCreateWoPjInput = Prisma.SociosCreateWithoutPessoaJuridicaInput;

export type TUserImportCreateInput = Prisma.UserImportsCreateInput;