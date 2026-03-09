import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PagarmeSubCyclesService } from '../pagarme/subscriptions/services/pagarme-cycles.service';
import { TCycleCreateManyInput, TCycleUpdateManyInput } from '../types/cycles.types';
import { InvoicesService } from './invoices.service';

@Injectable()
export class CyclesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeCyclesService: PagarmeSubCyclesService,
    private readonly invoicesService: InvoicesService,
  ) { }

  async createCyclesRecords(data: Array<TCycleCreateManyInput>) {
    await this.prismaService.pagarmeSubscriptionCycles.createMany({
      data: data,
    });
  }

  async updateCyclesRecords(data: Array<TCycleUpdateManyInput>) {
    await this.prismaService.pagarmeSubscriptionCycles.updateMany({
      data: data,
    });
  }

  async updateSubscriptionCycles(subscriptionId: string) {
    const cyclesRecords = await this.prismaService.pagarmeSubscriptionCycles.findMany({
      where: { subscriptionId: subscriptionId },
      select: {
        pagarmeCycleId: true,
        invoice: { select: { invoiceId: true, status: true } },
      },
    });

    const existingCyclesIds = cyclesRecords.map((cycle) => cycle.pagarmeCycleId);

    const cycles = await this.pagarmeCyclesService.listSubscriptionsCyclePagarme(subscriptionId, {});

    if (!cycles) {
      return null;
    }

    const createCycles = cycles.data
      .filter((cycle) => !existingCyclesIds.includes(cycle.id))
      .map((cycle) => {
        const invoiceInfo = cyclesRecords
          .filter((cycleRecord) => cycleRecord.pagarmeCycleId === cycle.id)
          ?.at(0)?.invoice;

        if (!invoiceInfo.invoiceId && new Date(cycle.end_at) < new Date()) {
          this.invoicesService.createCycleInvoice(subscriptionId, cycle.id);
        }

        return {
          cycle: cycle.cycle,
          duration: cycle.duration,
          pagarmeCycleId: cycle.id,
          status: cycle.status,
          startAt: cycle.start_at,
          endAt: cycle.end_at,
          pagarmeCreatedAt: new Date(cycle.created_at),
          pagarmeUpdatedAt: new Date(cycle.updated_at),
          billing_at: cycle.billing_at,
          subscriptionId: subscriptionId,
        };
      });

    const updateCycles = cycles.data
      .filter((cycle) => existingCyclesIds.includes(cycle.id))
      .map((cycle) => {
        const invoiceInfo = cyclesRecords
          .filter((cycleRecord) => cycleRecord.pagarmeCycleId === cycle.id)
          ?.at(0)?.invoice;

        if (!invoiceInfo.invoiceId && new Date(cycle.end_at) < new Date()) {
          this.invoicesService.createCycleInvoice(subscriptionId, cycle.id);
        }

        if (['pending', 'scheduled'].includes(invoiceInfo?.status)) {
          this.invoicesService.updateInvoice(invoiceInfo.invoiceId);
        }

        return {
          where: { pagarmeCycleId: cycle.id },
          data: {
            cycle: cycle.cycle,
            duration: cycle.duration,
            status: cycle.status,
            startAt: cycle.start_at,
            endAt: cycle.end_at,
            pagarmeCreatedAt: new Date(cycle.created_at),
            pagarmeUpdatedAt: new Date(cycle.updated_at),
            billing_at: cycle.billing_at,
          },
        };
      });

    await this.updateCyclesRecords(updateCycles);
    await this.createCyclesRecords(createCycles);
  }

  async renewSubscriptionCycle(subscriptionId: string) {
    const cycle = await this.pagarmeCyclesService.renewSubscriptionCyclePagarme(subscriptionId);

    if (!cycle) {
      return null;
    }

    await this.updateSubscriptionCycles(subscriptionId);
  }
}
