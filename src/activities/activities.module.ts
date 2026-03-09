import { Module } from '@nestjs/common';
import { AuxModule } from '../aux/aux.module';
import { ActivitiesService } from './activities.service';

@Module({
  imports: [AuxModule],
  controllers: [],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
