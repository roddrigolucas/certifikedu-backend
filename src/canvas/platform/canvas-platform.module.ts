import { Module } from '@nestjs/common';

//Services
import { CanvasJwtService } from './canvas-jwt.service';
import { CanvasUserController } from './controllers/canvas-user.controller';
import { CanvasBackgroundsController } from './controllers/canvas-backgrounds.controller';
import { CanvasCertificatesController } from './controllers/canvas-certificates.controller';
import { CanvasJwtController } from './controllers/canvas-jwt.controller';
import { CanvasStudentsController } from './controllers/canvas-students.controller';
import { CanvasTemplatesController } from './controllers/canvas-templates.controller';

//MODULES
import { PassportModule } from '@nestjs/passport';
import { AuxModule } from '../../_aux/_aux.module';
import { BackgroundsModule } from '../../backgrounds/backgrounds.module';
import { AWSModule } from '../../aws/aws.module';
import { UsersModule } from '../../users/users.module';
import { CertificatesModule } from '../../certificates/certificates.module';
import { SchoolsModule } from '../../schools/schools.module';
import { CoursesModule } from '../../courses/courses.module';
import { TemplatesModule } from '../../templates/templates.module';
import { AbilitiesModule } from '../../abilities/abilities.module';
import { CanvasPlatformStrategy } from './strategy/canvas-platform.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'canvasJwt' }),
    AWSModule,
    AuxModule,
    AbilitiesModule,
    BackgroundsModule,
    UsersModule,
    CertificatesModule,
    SchoolsModule,
    CoursesModule,
    TemplatesModule,
  ],
  controllers: [
    CanvasUserController,
    CanvasJwtController,
    CanvasCertificatesController,
    CanvasBackgroundsController,
    CanvasStudentsController,
    CanvasTemplatesController,
  ],
  providers: [CanvasJwtService, CanvasPlatformStrategy],
  exports: [CanvasJwtService],
})
export class CanvasPlatformModule {}
