import { Module } from '@nestjs/common';
import { PdiController } from './pdi.controller';
import { PdiService } from './pdi.service';
import { AuxModule } from 'src/aux/aux.module';
import { AbilitiesModule } from 'src/abilities/abilities.module';
import { AWSModule } from 'src/aws/aws.module';
import { RequestsModule } from 'src/requests/requests.module';

@Module({
  imports: [AuxModule, RequestsModule, AbilitiesModule, AWSModule],
  controllers: [PdiController],
  providers: [PdiService],
})
export class PdiModule { }
