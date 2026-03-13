import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserPhoneData } from '../interfaces/customer.interfaces';
import {
  ICreateCustomerPagarme,
  IEditCustomerPagarme,
} from '../pagarme/interfaces/customers/pagarme-customers-input.interfaces';
import { PagarmeCustomerService } from '../pagarme/services/pagarme-customer.service';
import { AddressService } from './address.service';
import { TCustomerCreateInput, TCustomerOutput, TCustomerUpdateInput } from '../types/customer.types';
import { TPessoaFisicaOutput } from '../../_aux/types/_aux.types';
import { AuxService } from '../../_aux/_aux.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auxService: AuxService,
    private readonly pagarmeCustomerService: PagarmeCustomerService,
    private readonly addressService: AddressService,
  ) {}

  private getUserPhoneData(phone: string): IUserPhoneData {
    return {
      country_code: '55',
      area_code: phone.slice(0, 2),
      number: phone.slice(2).replace('-', ''),
    };
  }

  private getCustomerInfo(pf: TPessoaFisicaOutput): IEditCustomerPagarme {
    return {
      name: pf.nome,
      email: pf.email,
      code: pf.idPF,
      document: pf.CPF,
      document_type: 'CPF',
      type: 'individual',
      birthdate: pf.dataDeNascimento,
      metadata: {
        updatedAt: pf.updatedAt,
        environment: this.auxService.environment,
      },
    };
  }

  private getCustomerCreateInfo(pf: TPessoaFisicaOutput): ICreateCustomerPagarme {
    return {
      ...this.getCustomerInfo(pf),
      address: this.addressService.getUserAddress(pf),
      phones: { mobile_phone: this.getUserPhoneData(pf.telefone) },
      metadata: {
        userId: pf.userId,
        environment: this.auxService.environment,
      },
    };
  }

  async getCustomerIdByUserId(userId: string): Promise<string> {
    const customer = await this.prismaService.pagarmeCustomers.findFirst({
      where: { userId: userId },
      select: { customerId: true, updatedAt: true },
    });

    if (!customer) {
      const pf = await this.auxService.getPfInfo(userId);
      return await this.createCustomer(pf);
    }

    if (customer.updatedAt.getTime() < new Date().getTime() - 30 * 24 * 60 * 60 * 1000) {
      await this.updateCustomerInfo(customer.customerId);
    }

    return customer.customerId;
  }

  async getCustomerByUserId(userId: string): Promise<TCustomerOutput> {
    return await this.prismaService.pagarmeCustomers.findFirst({
      where: { userId: userId },
    });
  }

  async getCustomerById(customerId: string): Promise<TCustomerOutput> {
    return await this.prismaService.pagarmeCustomers.findUnique({
      where: { customerId: customerId },
    });
  }

  async createCustomerRecord(customer: TCustomerCreateInput): Promise<TCustomerOutput> {
    return await this.prismaService.pagarmeCustomers.create({
      data: customer,
    });
  }

  async updateCustomerRecord(customerId: string, customer: TCustomerUpdateInput): Promise<TCustomerOutput> {
    return await this.prismaService.pagarmeCustomers.update({
      where: { customerId: customerId },
      data: customer,
    });
  }

  async editCustomerInfo(pf: TPessoaFisicaOutput, customerId: string) {
    const customer = await this.pagarmeCustomerService.editCustomerPagarme(customerId, this.getCustomerInfo(pf));

    if (!customer) {
      await this.prismaService.pagarmeCustomers.update({
        where: { customerId: customer.id },
        data: { inSync: false },
      });
    }

    const customerData: TCustomerUpdateInput = {
      customerCreatedAt: customer.created_at,
      customerUpdatedAt: customer.updated_at,
      name: customer.name,
      email: customer.email,
      code: customer.code,
      document: customer.document,
      documentType: customer.document_type,
      deliquent: customer.delinquent,
    };

    await this.prismaService.pagarmeCustomers.update({
      where: { customerId: customer.id },
      data: customerData,
    });
  }

  async updateCustomerInfo(customerId: string): Promise<TCustomerOutput> {
    const customer = await this.pagarmeCustomerService.getCustomerPagarme(customerId);

    if (!customer) {
      return null;
    }

    await this.addressService.updateOrCreateCustomerAddress(customer.id, customer.address);

    const customerData: TCustomerUpdateInput = {
      customerCreatedAt: customer.created_at,
      customerUpdatedAt: customer.updated_at,
      name: customer.name,
      email: customer.email,
      code: customer.code,
      document: customer.document,
      documentType: customer.document_type,
      deliquent: customer.delinquent,
      addresses: { connect: { addressId: customer.address.id } },
    };

    return await this.updateCustomerRecord(customer.id, customerData);
  }

  async createCustomer(pf: TPessoaFisicaOutput): Promise<string> {
    const customer = await this.pagarmeCustomerService.createCustomerPagarme(this.getCustomerCreateInfo(pf));

    if (!customer) {
      return null;
    }


    const customerData: TCustomerCreateInput = {
      customerId: customer.id,
      customerCreatedAt: customer.created_at,
      customerUpdatedAt: customer.updated_at,
      name: customer.name,
      email: customer.email,
      code: customer.code,
      document: customer.document,
      documentType: customer.document_type,
      deliquent: customer.delinquent,
      user: { connect: { id: pf.userId } },
    };

    const customerId = (await this.createCustomerRecord(customerData)).customerId;

    await this.addressService.updateOrCreateCustomerAddress(customer.id, customer.address);

    return customerId
  }
}
