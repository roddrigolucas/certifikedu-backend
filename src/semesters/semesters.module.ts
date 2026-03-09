import { Module } from '@nestjs/common';
import { SemestersService } from './semesters.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SemestersService],
  exports: [SemestersService],
})
export class SemestersModule {}
