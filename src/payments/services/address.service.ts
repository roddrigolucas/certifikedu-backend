import { Injectable } from '@nestjs/common';
import { AuxService } from '../../aux/aux.service';
import { TPessoaFisicaOutput } from '../../aux/types/aux.types';
import { PrismaService } from '../../prisma/prisma.service';
import { ICustomerAddressData } from '../interfaces/customer.interfaces';
import { IAddressQueryPagarme } from '../pagarme/interfaces/address/pagarme-address-input.interfaces';
import {
  ICardAddressResponsePagarme,
  ICustomerAddressResponsePagarme,
} from '../pagarme/interfaces/address/pagarme-address-response.interfaces';
import { PagarmeAddressService } from '../pagarme/services/pagarme-address.service';
import {
  TAddressCreateInput,
  TAddressCreateManyInput,
  TAddressOutput,
  TAddressUpdateInput,
} from '../types/address.types';

@Injectable()
export class AddressService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeAddressService: PagarmeAddressService,
    private readonly auxService: AuxService,
  ) {}

  getUserAddress(pf: TPessoaFisicaOutput): ICustomerAddressData {
    return {
      country: 'BR',
      state: pf.estado,
      city: pf.cidade,
      zip_code: pf.cepNumber,
      line_1: `${pf.numero}, ${pf.rua}, ${pf.bairro}`,
      line_2: pf.complemento ?? null,
    };
  }

  async getCustomerAddress(customerId: string): Promise<ICustomerAddressData> {
    const address = await this.prismaService.pagarmeAddresses.findFirst({
      where: { customerId: customerId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
      select: {
        country: true,
        state: true,
        city: true,
        zipCode: true,
        line1: true,
        line2: true,
      },
    });

    return {
      country: 'BR',
      state: address.state,
      city: address.city,
      zip_code: address.zipCode,
      line_1: address.line1,
      line_2: address?.line2 ?? '',
    };
  }

  async checkCustomerCardAddress(customerId: string, cardAddress: ICardAddressResponsePagarme): Promise<string> {
    await this.updateCustomerAddresses(customerId);

    const addressRecord = await this.prismaService.pagarmeAddresses.findFirst({
      where: {
        state: cardAddress.state,
        city: cardAddress.city,
        zipCode: cardAddress.zip_code,
        line1: cardAddress.line_1,
      },
      select: {
        addressId: true,
      },
    });

    if (!addressRecord) {
      return null;
    }

    return addressRecord.addressId;
  }

  async getCustomerAddresses(customerId: string): Promise<Array<TAddressOutput>> {
    return await this.prismaService.pagarmeAddresses.findMany({
      where: { customerId: customerId },
    });
  }

  async getCustomerAddressesIds(customerId: string): Promise<Array<string>> {
    return (
      await this.prismaService.pagarmeAddresses.findMany({
        where: { customerId: customerId },
        select: { addressId: true },
      })
    ).map((id) => id.addressId);
  }

  async createCustomerAddressRecord(data: TAddressCreateInput) {
    await this.prismaService.pagarmeAddresses.create({
      data: data,
    });
  }

  async updateCustomerAddressRecord(addressId: string, data: TAddressUpdateInput) {
    await this.prismaService.pagarmeAddresses.update({
      where: { addressId: addressId },
      data: data,
    });
  }

  async createManyCustomerAddressRecord(data: Array<TAddressCreateManyInput>) {
    await this.prismaService.pagarmeAddresses.createMany({
      data: data,
    });
  }

  async updateCustomerAddresses(customerId: string, queryParams: IAddressQueryPagarme = { page: 1, size: 100 }) {
    const addresses = await this.pagarmeAddressService.listCustomerAddressPagarme(customerId, queryParams);

    if (!addresses) {
      return null;
    }

    const customerAddressesIds = await this.getCustomerAddressesIds(customerId);

    addresses.data.map(async (address) => {
      if (customerAddressesIds.includes(address.id)) {
        await this.updateCustomerAddressRecord(address.id, {
          updatedAt: address.updated_at,
          country: address.country,
          state: address.state,
          status: address.status,
          city: address.city,
          zipCode: address.zip_code,
          line1: address.line_1,
          line2: address.line_2,
        });
      }
    });

    await this.createManyCustomerAddressRecord(
      addresses.data
        .map((address) => {
          if (!customerAddressesIds.includes(address.id)) {
            return {
              addressId: address.id,
              updatedAt: address.updated_at,
              country: address.country,
              state: address.state,
              status: address.status,
              city: address.city,
              zipCode: address.zip_code,
              line1: address.line_1,
              line2: address.line_2,
              customerId: customerId,
            };
          }

          return null;
        })
        .filter((a) => a != null),
    );
  }

  async updateOrCreateCustomerAddress(customerId: string, addressData: ICustomerAddressResponsePagarme) {
    const addressId = await this.prismaService.pagarmeAddresses.findFirst({
      where: { addressId: addressData.id, customerId: customerId },
      select: { addressId: true },
    });

    if (addressId) {
      const data: TAddressUpdateInput = {
        updatedAt: addressData.updated_at,
        country: addressData.country,
        state: addressData.state,
        status: addressData.status,
        city: addressData.city,
        zipCode: addressData.zip_code,
        line1: addressData.line_1,
        line2: addressData.line_2,
      };

      await this.updateCustomerAddressRecord(addressData.id, data);
      return null;
    }

    const data: TAddressCreateInput = {
      addressId: addressData.id,
      status: addressData.status,
      country: addressData.country,
      state: addressData.state,
      city: addressData.city,
      zipCode: addressData.zip_code,
      line1: addressData.line_1,
      line2: addressData.line_2,
      customer: { connect: { customerId: customerId } },
    };

    await this.createCustomerAddressRecord(data);
  }

  async getAddressAndUpdate(customerId: string, addressId: string): Promise<ICustomerAddressData> {
    const address = await this.pagarmeAddressService.getCustomerAddressPagarme(customerId, addressId);

    const data: TAddressUpdateInput = {
      country: address.country,
      state: address.state,
      status: address.status,
      city: address.city,
      zipCode: address.zip_code,
      line1: address.line_1,
      line2: address.line_2,
    };

    await this.updateCustomerAddressRecord(addressId, data);

    return {
      country: 'BR',
      state: address.state,
      city: address.city,
      zip_code: address.zip_code,
      line_1: address.line_1,
      line_2: address.line_2,
    };
  }

  async editCustomerAddress(customerId: string, pf: TPessoaFisicaOutput) {
    const address = {
      ...this.getUserAddress(pf),
      metadata: {
        userId: pf.userId,
        environment: this.auxService.environment,
      },
    };

    const addressData = await this.pagarmeAddressService.createCustomerAddressPagarme(customerId, address);

    const data: TAddressCreateInput = {
      addressId: addressData.id,
      status: addressData.status,
      country: addressData.country,
      state: addressData.state,
      city: addressData.city,
      zipCode: addressData.zip_code,
      line1: addressData.line_1,
      line2: addressData.line_2,
      customer: { connect: { customerId: customerId } },
    };

    await this.createCustomerAddressRecord(data);
  }

  async deleteCustomerAddress(customerId: string, addressId: string) {
    const address = await this.pagarmeAddressService.deleteCustomerAddressPagarme(customerId, addressId);

    const data: TAddressUpdateInput = {
      updatedAt: address.updated_at,
      country: address.country,
      state: address.state,
      status: address.status,
      city: address.city,
      zipCode: address.zip_code,
      line1: address.line_1,
      line2: address.line_2,
    };

    await this.updateCustomerAddressRecord(addressId, data);
  }
}
