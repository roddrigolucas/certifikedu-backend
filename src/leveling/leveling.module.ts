import { Module } from '@nestjs/common';
import { LevelingPjController } from "./leveling-pj.controller";
import { LevelingService } from "./leveling.service";
import { LevelingPfController } from "./leveling-pf.controller";
import { AuxModule } from 'src/common/common.module';
import { AuxService } from 'src/common/common.service';
import { S3Service } from 'src/aws/s3/s3.service';
import { AWSModule } from 'src/aws/aws.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { SchoolsModule } from 'src/schools/schools.module';
import { SchoolsService } from 'src/schools/schools.service';
import { LevelingSeeder } from './leveling.seeder';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [AuxModule, AWSModule, SchoolsModule, AuditModule],
  controllers: [LevelingPfController, LevelingPjController],
  providers: [LevelingService, AuxService, S3Service, PrismaService, SchoolsService, LevelingSeeder],
  exports: [LevelingService],
})
export class LevelingModule { }