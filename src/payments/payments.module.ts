//MODULES
import { Module } from '@nestjs/common';
import { PagarmeModule } from './pagarme/pagarme.module';
import { AuxModule } from '../_aux/_aux.module';
import { PagarmeSubscriptionsModule } from './pagarme/subscriptions/pagarme-subscriptions.module';
import { PagarmeOrdersModule } from './pagarme/orders/pagarme-orders.module';

//SERVICES
import { PaymentsService } from './services/payments.service';
import { CardsService } from './services/cards.service';
import { PlansService } from './services/plans.service';
import { CustomerService } from './services/customer.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { TransactionsService } from './services/transactions.service';
import { AddressService } from './services/address.service';
import { DiscountsService } from './services/discounts.service';
import { IncrementsService } from './services/increments.service';
import { SubscriptionsItemsService } from './services/subscription-items.service';
import { ChargesService } from './services/charges.service';
import { CyclesService } from './services/cycles.service';
import { InternalPlansService } from './services/internal-plans.service';
import { InvoicesService } from './services/invoices.service';

//CONTROLLERS
import { CardsController } from './controllers/cards.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { TransactionsController } from './controllers/transactions.controller';
import { PaymentsController } from './controllers/payments.controller';

@Module({
  imports: [AuxModule, PagarmeModule, PagarmeSubscriptionsModule, PagarmeOrdersModule],
  controllers: [PaymentsController, CardsController, SubscriptionsController, TransactionsController],
  providers: [
    AddressService,
    CardsService,
    ChargesService,
    CustomerService,
    CyclesService,
    DiscountsService,
    IncrementsService,
    InternalPlansService,
    InvoicesService,
    PaymentsService,
    PlansService,
    SubscriptionsService,
    SubscriptionsItemsService,
    TransactionsService,
  ],
  exports: [
    PaymentsService,
    SubscriptionsService,
    TransactionsService,
    DiscountsService,
    IncrementsService,
    InternalPlansService,
    PlansService,
  ],
})
export class PaymentsModule {}
