import { Module } from '@nestjs/common';
import { ActivitiesModule } from '../activities/activities.module';
import { InternshipsModule } from '../internships/internships.module';
import { SemestersModule } from '../semesters/semesters.module';
import { StudyFieldsModule } from '../studyfields/studyfields.module';
import { CurriculumsService } from './curriculums.service';

@Module({
  imports: [ActivitiesModule, InternshipsModule, SemestersModule, StudyFieldsModule],
  controllers: [],
  providers: [CurriculumsService],
  exports: [CurriculumsService],
})
export class CurriculumsModule {}
