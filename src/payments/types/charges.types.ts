import { Prisma } from "@prisma/client";

export type TChargesCreateInput = Prisma.PagarmeChargesCreateInput;
export type TChargesUpdateInput = Prisma.PagarmeChargesUpdateInput;

export type TChargesCreateManyInput = Prisma.PagarmeChargesCreateManyInput;
export type TChargesUpdateManyWoOrderInput = Prisma.PagarmeChargesUpdateManyWithWhereWithoutOrderInput;
export type TChargesUpdateManyWoInvoiceInput = Prisma.PagarmeChargesUpdateManyWithWhereWithoutInvoiceInput;
