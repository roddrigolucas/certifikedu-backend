import { Module } from '@nestjs/common';
import { AuxModule } from '../aux/aux.module';
import { AWSModule } from '../aws/aws.module';
import { BackgroundsService } from './background.service';

@Module({
  imports: [AWSModule, AuxModule],
  providers: [BackgroundsService],
  exports: [BackgroundsService],
})
export class BackgroundsModule {}
