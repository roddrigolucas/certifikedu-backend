import { Prisma } from "@prisma/client";


export type TEmailOutput = Prisma.InternalEmailTemplatesGetPayload<{}>;

export type TEmailCreateInput = Prisma.InternalEmailTemplatesCreateInput;
export type TEmailUpdateInput = Prisma.InternalEmailTemplatesUpdateInput;

