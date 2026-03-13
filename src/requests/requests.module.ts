import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuxModule } from 'src/_aux/_aux.module';
import { AWSModule } from '../aws/aws.module';
import { RequestsService } from './requests.service';

@Module({
  imports: [
    AWSModule,
    AuxModule,
    HttpModule.register({
      validateStatus: () => true,
    }),
  ],
  controllers: [],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
