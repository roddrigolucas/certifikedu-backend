import { Module } from '@nestjs/common';
import { CanvasController } from './canvas.controller';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { CanvasService } from './canvas.service';
import { CanvasRepository } from './repository/canvas.repository';
import { AuthModule } from '../auth/auth.module';
import { CanvasApiClient } from './canvas.client';
import { SchoolsModule } from '../schools/schools.module';
import { CoursesModule } from '../courses/courses.module';
import { PJInfoModule } from '../pjinfo/pjinfo.module';
import { LtiModule } from './lti/lti.module';
import { CanvasPlatformModule } from './platform/canvas-platform.module';
import { AWSModule } from '../aws/aws.module';

@Module({
  imports: [
    AWSModule,
    JwtModule,
    HttpModule,
    AuthModule,
    SchoolsModule,
    CoursesModule,
    PJInfoModule,
    LtiModule,
    CanvasPlatformModule,
  ],
  controllers: [CanvasController],
  providers: [CanvasService, CanvasRepository, CanvasApiClient],
})
export class CanvasModule {}
