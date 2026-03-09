import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AWSModule } from '../../../aws/aws.module';
import { PagarmeService } from '../services/pagarme.service';
import { PagarmeChargesService } from './services/pagarme-charges.service';
import { PagarmeOrderItemsService } from './services/pagarme-orders-items.service';
import { PagarmeOrderService } from './services/pagarme-orders.service';

@Module({
  imports: [
    HttpModule.register({
      validateStatus: () => true,
    }),
    AWSModule,
  ],
  controllers: [],
  providers: [PagarmeChargesService, PagarmeOrderService, PagarmeOrderItemsService, PagarmeService],
  exports: [PagarmeChargesService, PagarmeOrderService, PagarmeOrderItemsService],
})
export class PagarmeOrdersModule {}
