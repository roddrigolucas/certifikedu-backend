import { Module } from '@nestjs/common';
import { AuxModule } from '../aux/aux.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { UsersModule } from '../users/users.module';
import { RequestsModule } from '../requests/requests.module';
import { CorporateController } from './corporate.controller';
import { CorporateService } from './corporate.service';

@Module({
  imports: [RequestsModule, AuxModule, CertificatesModule, UsersModule],
  providers: [CorporateService],
  controllers: [CorporateController],
  exports: [CorporateService],
})
export class CorporateModule {}
