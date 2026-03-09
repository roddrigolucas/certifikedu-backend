import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { InstitutionalEventsModule } from 'src/institutional-events/inst-events.module';

@Module({
  imports: [InstitutionalEventsModule],
  controllers: [],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
