import { Module } from '@nestjs/common';
import { AuxModule } from 'src/aux/aux.module';
import { RequestsModule } from 'src/requests/requests.module';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

@Module({
  imports: [AuxModule, RequestsModule],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule {}
