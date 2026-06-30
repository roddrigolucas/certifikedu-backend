import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { InstitutionalEventsModule } from 'src/institutional-events/inst-events.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [InstitutionalEventsModule, AuditModule],
  controllers: [],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
