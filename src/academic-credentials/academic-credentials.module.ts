import { Module } from '@nestjs/common';
import { AcademicCredentialsService } from './academic-credentials.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AcademicCredentialsService],
  exports: [AcademicCredentialsService],
})
export class AcademicCredentialsModule {}
