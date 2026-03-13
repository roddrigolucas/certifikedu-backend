import { Module } from '@nestjs/common';
import { AuxModule } from '../_aux/_aux.module';
import { StudyFieldsService } from './studyfields.service';

@Module({
  imports: [AuxModule],
  controllers: [],
  providers: [StudyFieldsService],
  exports: [StudyFieldsService],
})
export class StudyFieldsModule {}
