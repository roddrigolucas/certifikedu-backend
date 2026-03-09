import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { AuxService } from '../../aux/aux.service';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { CreateCreditCardDto } from '../dtos/cards/cards-input.dto';
import { ResponseCardsDto, ResponseCreditCardDto, ResponsePaymentsCardsDto } from '../dtos/cards/cards-response.dto';
import { ICreateCardPagarme } from '../pagarme/interfaces/cards/pagarme-cards-input.interfaces';
import { AddressService } from '../services/address.service';
import { CardsService } from '../services/cards.service';
import { CustomerService } from '../services/customer.service';
import { TCardOutput } from '../types/cards.types';

@ApiTags('Payments -- Cards')
@Controller('payments/cards')
@UseGuards(JwtGuard)
export class CardsController {
  constructor(
    private readonly auxService: AuxService,
    private readonly cardsService: CardsService,
    private readonly customerService: CustomerService,
    private readonly addressService: AddressService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Post()
  async createCreditCard(
    @GetUser('id') userId: string,
    @Body() dto: CreateCreditCardDto,
  ): Promise<ResponsePaymentsCardsDto> {
    const customerId = await this.customerService.getCustomerIdByUserId(userId);

    if (!customerId) {
      throw new NotFoundException('Customer not found');
    }

    const cardInfo: ICreateCardPagarme = {
      number: dto.number,
      holder_name: dto.holderName,
      holder_document: dto.holderDocument,
      exp_month: dto.expMonth,
      exp_year: dto.expYear,
      cvv: dto.cvv,
      metadata: {
        userId: userId,
        environment: this.auxService.environment,
        isDefault: dto.setDefault,
      },
      billing_address: null,
    };

    if (dto.billing_address) {
      cardInfo.billing_address = {
        country: dto.billing_address.country,
        state: dto.billing_address.state,
        city: dto.billing_address.city,
        zip_code: dto.billing_address.zipCode,
        line_1: `${dto.billing_address.street}, ${dto.billing_address.streetNumber}`,
        line_2: dto.billing_address.complementary ?? null,
      };
    } else {
      cardInfo.billing_address = await this.addressService.getCustomerAddress(customerId);
    }

    const card = await this.cardsService.createCustomerCard(customerId, cardInfo);

    if (!card) {
      throw new ServiceUnavailableException('Error calling pagarme');
    }

    if (dto.setDefault) {
      await this.cardsService.setUserCardDefault(card.cardId, customerId);
    }

    return {
      status: 'Success',
      response: {
        message: 'Cartão cadastrado com sucesso',
        card: this.getCardResponse(userId, card),
      },
    };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Get()
  async getUserCards(@GetUser('id') userId: string): Promise<ResponseCardsDto> {
    const cards = await this.cardsService.getUserCardsRecords(userId);

    return {
      status: 'Success',
      response: {
        message: 'Cartão cadastrado com sucesso',
        cards: cards.map((card) => {
          return {
            userId: card.cardId,
            customerId: card.customerId,
            cardId: card.cardId,
            lastFourDigits: card.last_four_digits,
            expMonth: card.exp_month,
            expYear: card.exp_year,
            brand: card.brand,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
            isDefault: card.isDefault,
          };
        }),
      },
    };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Patch('default/:cardId')
  async setCardDefault(
    @GetUser('id') userId: string,
    @Param('cardId') cardId: string,
  ): Promise<ResponsePaymentsCardsDto> {
    const customerId = await this.customerService.getCustomerIdByUserId(userId);

    const card = await this.cardsService.setUserCardDefault(cardId, customerId);

    return {
      status: 'Success',
      response: {
        message: 'Cartão cadastrado com sucesso',
        card: this.getCardResponse(userId, card),
      },
    };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Delete(':id')
  async deleteUserCard(@GetUser('id') userId: string, @Param('id') cardId: string): Promise<{ success: boolean }> {
    return { success: await this.cardsService.deleteCustomerCard(userId, cardId) };
  }

  private getCardResponse(userId: string, card: TCardOutput): ResponseCreditCardDto {
    return {
      userId: userId,
      customerId: card.customerId,
      cardId: card.cardId,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      lastFourDigits: card.last_four_digits,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      brand: card.brand,
      isDefault: card.isDefault,
    };
  }
}
