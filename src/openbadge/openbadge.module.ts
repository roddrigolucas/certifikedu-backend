import { Module } from '@nestjs/common';
import { RequestsModule } from '../requests/requests.module';
import { AWSModule } from '../aws/aws.module';
import { OpenBadgeService } from './openbadge.service';
import { AuxModule } from '../aux/aux.module';

@Module({
  imports: [AWSModule, RequestsModule, AuxModule],
  controllers: [],
  providers: [OpenBadgeService],
  exports: [OpenBadgeService],
})
export class OpenBadgeModule {}
