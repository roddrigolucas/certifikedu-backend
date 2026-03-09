import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PagarmeSubInvoicesService } from '../pagarme/subscriptions/services/pagarme-invoices.service';
import {
  TInvoicesCreateInput,
  TInvoicesCreateManyInput,
  TInvoicesUpdateInput,
  TInvoicesUpdateManyInput,
} from '../types/invoices.types';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeInvoicesService: PagarmeSubInvoicesService,
  ) { }

  async createInvoiceRecord(data: TInvoicesCreateInput) {
    await this.prismaService.pagarmeInvoices.create({
      data: data,
    });
  }

  async updateInvoiceRecord(invoiceId: string, data: TInvoicesUpdateInput) {
    await this.prismaService.pagarmeInvoices.update({
      where: { pagarmeInvoiceId: invoiceId },
      data: data,
    });
  }

  async createManyInvoicesRecords(data: Array<TInvoicesCreateManyInput>) {
    await this.prismaService.pagarmeInvoices.createMany({
      data: data,
    });
  }

  async updateManyInvoicesRecords(data: Array<TInvoicesUpdateManyInput>) {
    await this.prismaService.pagarmeInvoices.updateMany({
      data: data,
    });
  }

  async createCycleInvoice(subscriptionId: string, cycleId: string) {
    const invoiceRecordId = (
      await this.prismaService.pagarmeInvoices.findUnique({
        where: { pagarmeCycleId: cycleId },
        select: { pagarmeInvoiceId: true },
      })
    ).pagarmeInvoiceId;

    if (invoiceRecordId) {
      await this.updateInvoice(invoiceRecordId);
      return null;
    }

    const invoice = await this.pagarmeInvoicesService.createInvoicePagarme(subscriptionId, cycleId);

    if (!invoice) {
      return null;
    }

    const invoiceData: TInvoicesCreateInput = {
      pagarmeInvoiceId: invoice.id,
      url: invoice.url,
      amount: invoice.amount,
      payment_method: invoice.payment_method,
      installments: invoice.installments ?? 1,
      status: invoice.status,
      billingAt: invoice.billing_at ? new Date(invoice.billing_at) : null,
      seenAt: invoice.seen_at ? new Date(invoice.seen_at) : null,
      dueAt: invoice.due_at ? new Date(invoice.due_at) : null,
      canceledAt: invoice.canceled_at ? new Date(invoice.canceled_at) : null,
      pagarmeUpdatedAt: new Date(invoice.updated_at),
      pagarmeCreatedAt: new Date(invoice.created_at),
      totalDiscount: invoice.total_discount ?? 0,
      totalIncrement: invoice.total_increment ?? 0,
      cycle: { connect: { pagarmeCycleId: invoice.cycle.id } },
    };

    await this.createInvoiceRecord(invoiceData);
  }

  async updateInvoice(invoiceId: string) {
    const invoice = await this.pagarmeInvoicesService.getInvoicePagarme(invoiceId);

    if (!invoice) {
      return null;
    }

    const invoiceData: TInvoicesCreateInput = {
      pagarmeInvoiceId: invoice.id,
      url: invoice.url,
      amount: invoice.amount,
      payment_method: invoice.payment_method,
      installments: invoice.installments ?? 1,
      status: invoice.status,
      billingAt: invoice.billing_at ? new Date(invoice.billing_at) : null,
      seenAt: invoice.seen_at ? new Date(invoice.seen_at) : null,
      dueAt: invoice.due_at ? new Date(invoice.due_at) : null,
      canceledAt: invoice.canceled_at ? new Date(invoice.canceled_at) : null,
      pagarmeUpdatedAt: new Date(invoice.updated_at),
      pagarmeCreatedAt: new Date(invoice.created_at),
      totalDiscount: invoice.total_discount ?? 0,
      totalIncrement: invoice.total_increment ?? 0,
      cycle: { connect: { pagarmeCycleId: invoice.cycle.id } },
    };

    await this.createInvoiceRecord(invoiceData);
  }

  async updateSubscriptionInvoices(subscriptionId: string) {
    const invoices = await this.pagarmeInvoicesService.listInvoicesPagarme({
      subscription_id: subscriptionId,
      page: 1,
      size: 24,
    });

    if (!invoices) {
      return null;
    }

    const internalInvoicesIds = (
      await this.prismaService.pagarmeInvoices.findMany({
        where: { cycle: { subscriptionId: subscriptionId } },
        select: { pagarmeInvoiceId: true },
      })
    ).map((invoice) => invoice.pagarmeInvoiceId);

    const createInvoices: Array<TInvoicesCreateManyInput> = invoices.data
      .filter((invoice) => !internalInvoicesIds.includes(invoice.id))
      .map((invoice) => {
        return {
          pagarmeInvoiceId: invoice.id,
          url: invoice.url,
          amount: invoice.amount,
          payment_method: invoice.payment_method,
          installments: invoice.installments ?? 1,
          status: invoice.status,
          billingAt: invoice.billing_at ? new Date(invoice.billing_at) : null,
          seenAt: invoice.seen_at ? new Date(invoice.seen_at) : null,
          dueAt: invoice.due_at ? new Date(invoice.due_at) : null,
          canceledAt: invoice.canceled_at ? new Date(invoice.canceled_at) : null,
          pagarmeUpdatedAt: new Date(invoice.updated_at),
          pagarmeCreatedAt: new Date(invoice.created_at),
          totalDiscount: invoice.total_discount ?? 0,
          totalIncrement: invoice.total_increment ?? 0,
          pagarmeCycleId: invoice.cycle.id,
        };
      });

    const updateInvoices: Array<TInvoicesUpdateManyInput> = invoices.data
      .filter((invoice) => internalInvoicesIds.includes(invoice.id))
      .map((invoice) => {
        if (['pending', 'scheduled'].includes(invoice.status)) {
          return {
            where: { pagarmeInvoiceId: invoice.id },
            data: {
              pagarmeInvoiceId: invoice.id,
              url: invoice.url,
              amount: invoice.amount,
              payment_method: invoice.payment_method,
              installments: invoice.installments ?? 1,
              status: invoice.status,
              billingAt: invoice.billing_at ? new Date(invoice.billing_at) : null,
              seenAt: invoice.seen_at ? new Date(invoice.seen_at) : null,
              dueAt: invoice.due_at ? new Date(invoice.due_at) : null,
              canceledAt: invoice.canceled_at ? new Date(invoice.canceled_at) : null,
              pagarmeUpdatedAt: new Date(invoice.updated_at),
              pagarmeCreatedAt: new Date(invoice.created_at),
              totalDiscount: invoice.total_discount ?? 0,
              totalIncrement: invoice.total_increment ?? 0,
              pagarmeCycleId: invoice.cycle.id,
            },
          };
        }
      });

    await this.createManyInvoicesRecords(createInvoices);
    await this.updateManyInvoicesRecords(updateInvoices);
  }
}
