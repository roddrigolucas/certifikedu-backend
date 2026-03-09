import { Injectable } from '@nestjs/common';
import {
  ICreatePlanPagarme,
  IEditPlanItemPagarme,
  IEditPlanMetadataPagarme,
  IEditPlanPagarme,
  IIncludePlanItemPagarme,
  IListPlansQueryPagarme,
} from '../interfaces/plans/pagarme-plans-input.interfaces';
import {
  IListPlanResponsePagarme,
  IPlanItemResponsePagarme,
  IPlanResponsePagarme,
} from '../interfaces/plans/pagarme-plans-response.interfaces';
import { PagarmeService } from './pagarme.service';

@Injectable()
export class PagarmePlansService {
  constructor(private readonly pagarmeService: PagarmeService) 
  {}

  async createPlanItemPagarme(
    planId: string,
    planItemInfo: IIncludePlanItemPagarme,
  ): Promise<IPlanItemResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/plans/${planId}/items`, planItemInfo);

    if (!response) {
      return null;
    }

    return response.data;
  }

  async editPlanItemPagarme(
    planId: string,
    itemId: string,
    planItemInfo: IEditPlanItemPagarme,
  ): Promise<IPlanItemResponsePagarme> {
    const response = await this.pagarmeService.axios.put(`/plans/${planId}/items/${itemId}`, planItemInfo);

    if (!response) {
      return null;
    }

    return response.data;
  }

  async removePlanItemPagarme(planId: string, itemId: string): Promise<IPlanItemResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/plans/${planId}/items/${itemId}`);

    if (!response) {
      return null;
    }

    return response.data;
  }

  async createPlanPagarme(planInfo: ICreatePlanPagarme): Promise<IPlanResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/plans`, planInfo);

    if (!response) {
      return null;
    }

    return response.data;
  }

  async getPlanPagarme(planId: string): Promise<IPlanResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/plans/${planId}`);

    if (!response) {
      return null;
    }

    return response.data;
  }

  async listPlansPagarme(queryParams: IListPlansQueryPagarme): Promise<IListPlanResponsePagarme> {
    const params = new URLSearchParams();

    if (queryParams.name) params.append('name', queryParams.name);
    if (queryParams.status) params.append('status', queryParams.status.toLowerCase());
    if (queryParams.created_since) params.append('created_since', queryParams.created_since.toString());
    if (queryParams.created_until) params.append('created_until', queryParams.created_until.toString());

    params.append('page', queryParams.page.toString());
    params.append('size', queryParams.size.toString());

    const response = await this.pagarmeService.axios.get<IListPlanResponsePagarme>(`/plans?${params.toString()}`);

    if (!response) {
      return null;
    }

    // const environment = this.auxService.isLocal ? 'local' : this.auxService.environment;

    return {
      data: response.data.data, //.filter((plan) => plan.metadata.environment === environment),
      paging: response.data.paging,
    };
  }

  async editPlanPagarme(planId: string, planInfo: IEditPlanPagarme): Promise<IPlanResponsePagarme> {
    const response = await this.pagarmeService.axios.put(`/plans/${planId}`, planInfo);

    if (!response) {
      return null;
    }

    return response.data;
  }

  async editPlanMetadataPagarme(
    planId: string,
    planMetadataInfo: IEditPlanMetadataPagarme,
  ): Promise<IPlanResponsePagarme> {
    const response = await this.pagarmeService.axios.put(`/plans/${planId}`, planMetadataInfo);

    if (!response) {
      return null;
    }

    return response.data;
  }

  async deletePlanPagarme(planId: string): Promise<IPlanResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/plans/${planId}`);

    if (!response) {
      return null;
    }

    return response.data;
  }
}
