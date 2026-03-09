import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AWSModule } from '../../aws/aws.module';
import { CoursesModule } from '../../courses/courses.module';
import { SchoolsModule } from '../../schools/schools.module';
import { CanvasService } from '../canvas.service';
import { CanvasJwtService } from '../platform/canvas-jwt.service';
import { JwtService } from '@nestjs/jwt';
import { LtiService } from './lti.service';
import { CanvasApiClient } from '../canvas.client';
import { CanvasRepository } from '../repository/canvas.repository';
import { LtiController } from './lti.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [HttpModule, SchoolsModule, CoursesModule, AWSModule, AuthModule],
  controllers: [LtiController],
  providers: [LtiService, JwtService, CanvasRepository, CanvasService, CanvasJwtService, CanvasApiClient],
  exports: [LtiService],
})
export class LtiModule {}
