import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
