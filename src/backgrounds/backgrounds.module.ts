import { Module } from '@nestjs/common';
import { AuxModule } from '../common/common.module';
import { AWSModule } from '../aws/aws.module';
import { BackgroundsService } from './background.service';

@Module({
  imports: [AWSModule, AuxModule],
  providers: [BackgroundsService],
  exports: [BackgroundsService],
})
export class BackgroundsModule {}
