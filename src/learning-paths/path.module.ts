import { Module } from '@nestjs/common';
import { AuxModule } from 'src/_aux/_aux.module';
import { LearningPathService } from './path.service';
import { LearningPathController } from './paths.controller';
import { ActivitiesModule } from 'src/activities/activities.module';
import { InternshipsModule } from 'src/internships/internships.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { InstitutionalEventsModule } from 'src/institutional-events/inst-events.module';

@Module({
  imports: [AuxModule, InstitutionalEventsModule, SubjectsModule, InternshipsModule, ActivitiesModule],
  controllers: [LearningPathController],
  providers: [LearningPathService],
  exports: [LearningPathService],
})
export class LearningPathsModule {}
