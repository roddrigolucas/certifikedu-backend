import { Module } from '@nestjs/common';
import { AuxModule } from 'src/aux/aux.module';
import { MetabaseService } from './metabase.service';
import { AWSModule } from 'src/aws/aws.module';

@Module({
  imports: [AuxModule, AWSModule],
  controllers: [],
  providers: [MetabaseService],
  exports: [MetabaseService],
})
export class MetabaseModule {}
