import { Injectable } from '@nestjs/common';
import { AuxService } from 'src/aux/aux.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ICreatePlan, IEditPlan, IEditPlanItem } from '../interfaces/plans.interface';
import {
  ICreatePlanPagarme,
  IEditPlanItemPagarme,
  IEditPlanPagarme,
  IListPlansQueryPagarme,
} from '../pagarme/interfaces/plans/pagarme-plans-input.interfaces';
import {
  IPlanItemResponsePagarme,
  IPlanResponsePagarme,
} from '../pagarme/interfaces/plans/pagarme-plans-response.interfaces';
import { PagarmePlansService } from '../pagarme/services/pagarme-plans.service';
import {
  TPagarmeBasicPlanInfoOutput,
  TPagarmePlanCreateInput,
  TPagarmePlanInfoOutput,
  TPagarmePlanItemUpdateInput,
  TPagarmePlanUpdateInput,
} from '../types/plans.types';

@Injectable()
export class PlansService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auxService: AuxService,
    private readonly pagarmePlansService: PagarmePlansService,
  ) {}

  async checkPlanById(planId: string, installments = 1): Promise<boolean> {
    const plan = await this.refreshPlan(planId);

    if (!plan || !plan?.isActive) {
      return false;
    }

    if (installments && !plan.installments.includes(installments)) {
      return false;
    }

    return true;
  }

  async getPlanById(planId: string): Promise<TPagarmePlanInfoOutput> {
    return await this.prismaService.pagarmePlans.findUnique({
      where: { planId: planId, isActive: true },
      include: { items: true },
    });
  }

  async getPlansByIds(planIds: Array<string>): Promise<Array<TPagarmePlanInfoOutput>> {
    return await this.prismaService.pagarmePlans.findMany({
      where: { planId: { in: planIds } },
      include: { items: true },
    });
  }

  async listPlans(): Promise<Array<TPagarmeBasicPlanInfoOutput>> {
    return await this.prismaService.pagarmePlans.findMany({
      where: { isActive: true },
      select: {
        createdAt: true,
        recommendend: true,
        planName: true,
        montlhyPrice: true,
        receivedCertificateQuota: true,
        planId: true,
        emittedCertificatesQuota: true,
      },
    });
  }

  async getPlansIds(): Promise<Array<{ planId: string; updatedAt: Date }>> {
    return await this.prismaService.pagarmePlans.findMany({
      select: { planId: true, updatedAt: true },
    });
  }

  async createPlanRecord(data: TPagarmePlanCreateInput): Promise<TPagarmePlanInfoOutput> {
    return await this.prismaService.pagarmePlans.create({
      data: data,
      include: { items: true },
    });
  }

  async updatePlanRecord(planId: string, data: TPagarmePlanUpdateInput): Promise<TPagarmePlanInfoOutput> {
    return await this.prismaService.pagarmePlans.update({
      where: { planId: planId },
      data: data,
      include: { items: true },
    });
  }

  async updatePlanItemRecord(planItemId: string, data: TPagarmePlanUpdateInput) {
    return await this.prismaService.pagarmePlanItems.update({
      where: { planItemId: planItemId },
      data: data,
    });
  }

  async refreshPlanInfo(plan: IPlanResponsePagarme) {
    const planData: TPagarmePlanUpdateInput = {
      planId: plan.id,
      updatedAt: plan.updated_at,
      isActive: plan.status === 'active' ? true : false,
      interval: plan.interval,
      installments: plan.installments,
      planName: plan.name,
      billingType: plan.billing_type,
      paymentMethod: plan.payment_methods,
    };

    await this.updatePlanRecord(plan.id, planData);
  }

  async getPlansInfo(queryParams: IListPlansQueryPagarme): Promise<Array<TPagarmePlanInfoOutput>> {
    const plansPagarme = await this.pagarmePlansService.listPlansPagarme(queryParams);

    if (!plansPagarme) {
      return [];
    }

    const internalPlansIds = await this.getPlansIds();

    // const environment = this.auxService.isLocal ? 'local' : this.auxService.environment;

    const plansIds = plansPagarme.data
      // .filter((plan) => plan?.metadata?.environment === environment)
      .map(async (plan) => {
        if (!internalPlansIds.map((planInfo) => planInfo.planId).includes(plan.id)) {
          await this.pagarmePlansService.deletePlanPagarme(plan.id);
          return null;
        }

        const internalPlan = internalPlansIds.filter((planInfo) => planInfo.planId === plan.id).at(0);

        if (new Date(plan.updated_at) > internalPlan.updatedAt) {
          await this.refreshPlanInfo(plan);
        }

        return plan.id;
      });

    return await this.getPlansByIds((await Promise.all(plansIds)).filter((id) => id != null));
  }

  async createPlan(data: ICreatePlan): Promise<TPagarmePlanInfoOutput> {
    const { planInfo, planData } = this.createPlanObjects(data);

    const plan = await this.pagarmePlansService.createPlanPagarme(planInfo);

    if (!plan) {
      return null;
    }

    return await this.createPlanRecord({
      ...planData,
      planId: plan.id,
      items: {
        createMany: {
          data: plan.items.map((item) => {
            return {
              planItemId: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.pricing_scheme.price,
              schemeType: item.pricing_scheme.scheme_type,
              cycles: item.cycles ?? 0,
            };
          }),
        },
      },
    });
  }

  async editPlan(planId: string, data: IEditPlan): Promise<TPagarmePlanInfoOutput> {
    const planInfo: IEditPlanPagarme = {
      name: data.planName,
      status: 'active',
      description: data?.descriptionPagarme ?? '',
      payment_methods: data.payment_methods,
      installments: data.installments,
      minimum_price: data.minimum_price,
      statement_descriptor: data.statement_descriptor,
      currency: 'BRL',
      interval: data.interval as IEditPlanPagarme['interval'],
      interval_count: data.interval_count,
      trial_period_days: data.trial_period_days,
      billing_type: data.billing_type,
      billing_days: data.billing_days,
      metadata: {
        pdisQty: data.pdisQty,
        pdiPeriod: data.pdiPeriod.toString(),
        environment: this.auxService.isLocal ? 'local' : this.auxService.environment,
        emittedCertificatesQuota: data.emittedCertificatesQuota,
        emittedCertificatesPeriod: data.emittedCertificatesPeriod.toString(),
        receivedCertificateQuota: data.receivedCertificateQuota,
        receivedCertificatePeriod: data.receivedCertificatePeriod.toString(),
      },
    };

    const plan = await this.pagarmePlansService.editPlanPagarme(planId, planInfo);

    if (!plan) {
      return null;
    }

    if (plan.items.length === 1) {
      const { pricing_scheme, quantity, ...rest } = plan.items.at(0);
      const itemData: IEditPlanItemPagarme = {
        name: rest.name,
        description: rest.description,
        cycles: rest.cycles,
        quantity: quantity ?? 1,
        pricing_schema: {
          price: data?.price ?? pricing_scheme.price,
          scheme_type: 'Unit',
          minimum_price: data?.minimum_price ?? pricing_scheme?.minimum_price,
        },
      };

      await this.pagarmePlansService.editPlanItemPagarme(planId, rest.id, itemData);
    }

    const planData: TPagarmePlanUpdateInput = {
      planId: plan.id,
      updatedAt: plan.updated_at,
      isActive: plan.status === 'active' ? true : false,
      description: data.description,
      interval: plan.interval,
      installments: plan.installments,
      planName: plan.name,
      trialPeriodDays: data.trial_period_days,
      billingType: plan.billing_type,
      billingDays: data.billing_days,
      paymentMethod: plan.payment_methods,
      pdisQty: data.pdisQty,
      pdiPeriod: data.pdiPeriod,
      emittedCertificatesQuota: data.emittedCertificatesQuota,
      emittedCertificatesPeriod: data.emittedCertificatesPeriod,
      receivedCertificateQuota: data.receivedCertificateQuota,
      receivedCertificatePeriod: data.receivedCertificatePeriod,
    };

    return await this.updatePlanRecord(planId, planData);
  }

  async editPlanItem(planId: string, itemId: string, data: IEditPlanItem): Promise<TPagarmePlanInfoOutput> {
    const planItem = await this.pagarmePlansService.editPlanItemPagarme(planId, itemId, {
      ...data,
      quantity: data?.quantity ?? 1,
      pricing_schema: {
        ...data.pricing_schema,
        scheme_type: 'Unit',
      },
    });

    if (!planItem) {
      return null;
    }

    //TODO: fix this
    const planData: TPagarmePlanItemUpdateInput = {
      schemeType: data.pricing_schema.scheme_type,
      price: data.pricing_schema.price,
    };

    await this.updatePlanItemRecord(itemId, planData);

    return this.getPlanById(planId);
  }

  async refreshPlanItems(data: Array<IPlanItemResponsePagarme>) {
    const planItems = (
      await this.prismaService.pagarmePlanItems.findMany({
        where: { planItemId: { in: data.map((item) => item.id) } },
        select: { planItemId: true },
      })
    ).map((item) => item.planItemId);

    const querys = data
      .map((item) => {
        const { plan: _plan, ...rest } = item;

        if (!planItems.includes(item.id)) {
          return null;
        }

      //TODO: fix this
        const updateData: TPagarmePlanItemUpdateInput = {
          // ...rest,
          schemeType: rest.pricing_scheme.scheme_type,
          price: rest.pricing_scheme.price,
        };

        return this.prismaService.pagarmePlanItems.update({
          where: { planItemId: rest.id },
          data: updateData,
        });
      })
      .filter((query) => query !== null);

    await this.prismaService.$transaction(querys);
  }

  async refreshPlan(planId: string): Promise<TPagarmePlanInfoOutput> {
    const internalPlan = await this.prismaService.pagarmePlans.findUnique({
      where: { planId: planId, isActive: true },
    });

    if (!internalPlan) {
      return null;
    }

    const plan = await this.pagarmePlansService.getPlanPagarme(planId);

    if (!plan) {
      return null;
    }

    const planData: TPagarmePlanUpdateInput = {
      planId: plan.id,
      updatedAt: plan.updated_at,
      isActive: plan.status === 'active' ? true : false,
      interval: plan.interval,
      installments: plan.installments,
      planName: plan.name,
      billingType: plan.billing_type,
      paymentMethod: plan.payment_methods,
    };

    await this.refreshPlanItems(plan.items);

    return await this.updatePlanRecord(planId, planData);
  }

  async deletePlan(planId: string) {
    const plan = await this.pagarmePlansService.deletePlanPagarme(planId);

    if (!plan) {
      return null;
    }

    const planData: TPagarmePlanUpdateInput = {
      planId: plan.id,
      updatedAt: plan.updated_at,
      isActive: plan.status === 'active' ? true : false,
      interval: plan.interval,
      installments: plan.installments,
      planName: plan.name,
      billingType: plan.billing_type,
      paymentMethod: plan.payment_methods,
    };

    await this.refreshPlanItems(plan?.items ?? []);

    return await this.updatePlanRecord(planId, planData);
  }

  async refreshPlans(queryParams: IListPlansQueryPagarme = { page: 0, size: 100 }) {
    const plansPagarme = await this.pagarmePlansService.listPlansPagarme(queryParams);

    if (!plansPagarme) {
      return [];
    }
  }

  private createPlanObjects(data: ICreatePlan): { planInfo: ICreatePlanPagarme; planData: TPagarmePlanCreateInput } {
    const planInfo = {
      name: data.planName,
      description: data.descriptionPagarme,
      shippable: false,
      payment_methods: data.payment_methods,
      installments: data.installments,
      statement_descriptor: data.statement_descriptor,
      currency: 'BRL' as ICreatePlanPagarme['currency'],
      interval: data.interval as ICreatePlanPagarme['interval'],
      interval_count: data.interval_count,
      trial_period_days: data.trial_period_days,
      billing_type: data.billing_type,
      billing_days: data.billing_days,
      items: data.items.map((item) => {
        return {
          ...item,
          name: item.name,
          quantity: item.quantity,
          pricing_scheme: {
            price: item.pricing_scheme.price,
            scheme_type: 'Unit' as ICreatePlanPagarme['items'][0]['pricing_scheme']['scheme_type'],
            minimum_price: item.pricing_scheme.minimum_price,
          },
        };
      }),
      metadata: {
        pdisQty: data.pdisQty,
        pdiPeriod: data.pdiPeriod.toString(),
        environment: this.auxService.isLocal ? 'local' : this.auxService.environment,
        emittedCertificatesQuota: data.emittedCertificatesQuota,
        emittedCertificatesPeriod: data.emittedCertificatesPeriod.toString(),
        receivedCertificateQuota: data.receivedCertificateQuota,
        receivedCertificatePeriod: data.receivedCertificatePeriod.toString(),
      },
    };

    const planData: TPagarmePlanCreateInput = {
      planId: null,
      description: data.description,
      descriptionPagarme: data.descriptionPagarme,
      interval: data.interval,
      planName: data.planName,
      billingType: data.billing_type,
      pdisQty: data.pdisQty,
      pdiPeriod: data.pdiPeriod,
      emittedCertificatesQuota: data.emittedCertificatesQuota,
      emittedCertificatesPeriod: data.emittedCertificatesPeriod,
      receivedCertificateQuota: data.receivedCertificateQuota,
      receivedCertificatePeriod: data.receivedCertificatePeriod,
      singleCertificatePrice: data.singleCertificatePrice,
      montlhyPrice: data.items.reduce((acc, item) => item.pricing_scheme.price + acc, 0),
    };

    return { planInfo, planData };
  }
}
