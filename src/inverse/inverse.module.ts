import { Module } from '@nestjs/common';
import { AuxModule } from 'src/_aux/_aux.module';
import { AWSModule } from 'src/aws/aws.module';
import { InverseService } from './inverse.service';

@Module({
  imports: [AuxModule, AWSModule],
  controllers: [],
  providers: [InverseService],
  exports: [InverseService],
})
export class InverseModule {}
