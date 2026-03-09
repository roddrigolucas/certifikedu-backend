import { Module } from '@nestjs/common';
import { AWSModule } from '../aws/aws.module';
import { AuxService } from './_aux.service';

@Module({
  imports: [AWSModule],
  providers: [AuxService],
  exports: [AuxService],
})
export class AuxModule { }
