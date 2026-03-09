import { Prisma } from "@prisma/client";


export type TAddressCreateInput = Prisma.PagarmeAddressesCreateInput;
export type TAddressCreateManyInput = Prisma.PagarmeAddressesCreateManyInput;

export type TAddressUpdateInput = Prisma.PagarmeAddressesUpdateInput;

export type TAddressOutput = Prisma.PagarmeAddressesGetPayload<{}>;
