import { Module } from '@nestjs/common';
import { AuxModule } from '../_aux/_aux.module';
import { InternshipsService } from './internships.service';

@Module({
  imports: [AuxModule],
  controllers: [],
  providers: [InternshipsService],
  exports: [InternshipsService],
})
export class InternshipsModule {}
