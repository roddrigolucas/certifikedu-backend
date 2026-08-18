import { Module } from '@nestjs/common';
import { AuxModule } from 'src/common/common.module';
import { RequestsModule } from 'src/requests/requests.module';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { ResumeParserService } from './resume-parser.service';

@Module({
  imports: [AuxModule, RequestsModule],
  controllers: [ResumesController],
  providers: [ResumesService, ResumeParserService],
})
export class ResumesModule {}
