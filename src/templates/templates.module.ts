import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { AuxModule } from '../aux/aux.module';
import { TemplatesService } from './templates.service';
import { AWSModule } from '../aws/aws.module';
import { RequestsModule } from '../requests/requests.module';
import { SchoolsModule } from '../schools/schools.module';
import { BackgroundsModule } from '../backgrounds/backgrounds.module';
import { AbilitiesModule } from '../abilities/abilities.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { FontsModule } from 'src/fonts/fonts.module';

@Module({
  imports: [
    AWSModule,
    RequestsModule,
    AuxModule,
    SchoolsModule,
    BackgroundsModule,
    AbilitiesModule,
    CertificatesModule,
    FontsModule
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
