import { Module } from '@nestjs/common';
import { AuxModule } from '../common/common.module';
import { ActivitiesService } from './activities.service';

@Module({
  imports: [AuxModule],
  controllers: [],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
