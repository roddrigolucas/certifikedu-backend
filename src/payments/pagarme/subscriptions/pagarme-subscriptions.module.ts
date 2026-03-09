import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AWSModule } from '../../../aws/aws.module';
import { PagarmeSubItemsService } from './services/pagarme-items.service';
import { PagarmeSubUsageService } from './services/pagarme-usage.service';
import { PagarmeSubCyclesService } from './services/pagarme-cycles.service';
import { PagarmeSubInvoicesService } from './services/pagarme-invoices.service';
import { PagarmeSubDiscoutsService } from './services/pagarme-discounts.service';
import { PagarmeSubIncrementsService } from './services/pagarme-increments.service';
import { PagarmeSubscriptionsService } from './services/pagarme-subscriptions.service';
import { PagarmeService } from '../services/pagarme.service';

@Module({
  imports: [
    HttpModule.register({
      validateStatus: () => true,
    }),
    AWSModule,
  ],
  controllers: [],
  providers: [
    PagarmeService,
    PagarmeSubUsageService,
    PagarmeSubItemsService,
    PagarmeSubCyclesService,
    PagarmeSubInvoicesService,
    PagarmeSubDiscoutsService,
    PagarmeSubIncrementsService,
    PagarmeSubscriptionsService,
  ],
  exports: [
    PagarmeSubUsageService,
    PagarmeSubItemsService,
    PagarmeSubCyclesService,
    PagarmeSubInvoicesService,
    PagarmeSubDiscoutsService,
    PagarmeSubIncrementsService,
    PagarmeSubscriptionsService,
  ],
})
export class PagarmeSubscriptionsModule {}
