import { Module } from '@nestjs/common';
import { InstitutionalEventsService } from './inst-events.service';

@Module({
  imports: [],
  controllers: [],
  providers: [InstitutionalEventsService],
  exports: [InstitutionalEventsService],
})
export class InstitutionalEventsModule {}
