import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuxModule } from 'src/common/common.module';
import { AWSModule } from '../aws/aws.module';
import { RequestsService } from './requests.service';
import { BullModule } from '@nestjs/bullmq';
import { QueueProcessor } from '../aws/sqs/queue.processor';

@Module({
  imports: [
    AWSModule,
    AuxModule,
    HttpModule.register({
      validateStatus: () => true,
    }),
    BullModule.registerQueue({
      name: 'certificates-queue',
    }),
  ],
  controllers: [],
  providers: [RequestsService, QueueProcessor],
  exports: [RequestsService],
})
export class RequestsModule {}
