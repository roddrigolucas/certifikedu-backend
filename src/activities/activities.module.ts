import { Module } from '@nestjs/common';
import { AuxModule } from '../_aux/_aux.module';
import { ActivitiesService } from './activities.service';

@Module({
  imports: [AuxModule],
  controllers: [],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
