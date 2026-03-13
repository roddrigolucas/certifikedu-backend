import { Module } from '@nestjs/common';
import { AWSModule } from '../../aws/aws.module';
import { HttpModule } from '@nestjs/axios';
import { AuxModule } from 'src/_aux/_aux.module';
import { PagarmeCardsService } from './services/pagarme-cards.service';
import { PagarmeCustomerService } from './services/pagarme-customer.service';
import { PagarmePlansService } from './services/pagarme-plans.service';
import { PagarmeService } from './services/pagarme.service';
import { PagarmeAddressService } from './services/pagarme-address.service';

@Module({
  imports: [
    HttpModule.register({
      validateStatus: () => true,
    }),
    AWSModule,
    AuxModule,
  ],
  controllers: [],
  providers: [PagarmeService, PagarmeCardsService, PagarmeCustomerService, PagarmePlansService, PagarmeAddressService],
  exports: [PagarmeService, PagarmeAddressService, PagarmeCardsService, PagarmeCustomerService, PagarmePlansService],
})
export class PagarmeModule {}
