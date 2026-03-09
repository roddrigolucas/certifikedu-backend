import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { SchoolsService } from './schools.service';

@Module({
  imports: [CoursesModule],
  controllers: [],
  providers: [SchoolsService],
  exports: [SchoolsService],
})
export class SchoolsModule {}
