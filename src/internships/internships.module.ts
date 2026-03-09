import { Module } from '@nestjs/common';
import { AuxModule } from '../aux/aux.module';
import { InternshipsService } from './internships.service';

@Module({
  imports: [AuxModule],
  controllers: [],
  providers: [InternshipsService],
  exports: [InternshipsService],
})
export class InternshipsModule {}
